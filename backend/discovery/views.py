from datetime import timedelta

from django.contrib.contenttypes.models import ContentType
from django.db.models import Q
from django.utils import timezone
from rest_framework import permissions, serializers
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from . import home
from .cards import TYPE_MODELS, TYPES, cards, queryset
from .models import SearchQuery, ViewEvent

REPEAT_VIEW_WINDOW = timedelta(minutes=30)
SEARCH_PER_TYPE = 50
SEARCH_MAX_LIMIT = 50


class TrackViewSerializer(serializers.Serializer):
    type = serializers.ChoiceField(choices=list(TYPES))
    id = serializers.IntegerField(min_value=1)


class TrackView(APIView):
    """
    POST {type, id} when someone opens a course or piece of content.
    Anonymous views count toward Trending; signed-in views also feed Recently viewed.
    """
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "view-track"

    def post(self, request):
        data = TrackViewSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        type_key, object_id = data.validated_data["type"], data.validated_data["id"]
        if not queryset(type_key).filter(pk=object_id).exists():
            return Response({"detail": "Not found."}, status=404)

        content_type = ContentType.objects.get(app_label__in=["pages", "learning"], model=TYPE_MODELS[type_key])
        user = request.user if request.user.is_authenticated else None
        if user is not None:
            recent = ViewEvent.objects.filter(
                user=user, content_type=content_type, object_id=object_id,
                viewed_at__gte=timezone.now() - REPEAT_VIEW_WINDOW,
            )
            if recent.update(viewed_at=timezone.now()):
                return Response(status=204)
        ViewEvent.objects.create(user=user, content_type=content_type, object_id=object_id)
        return Response(status=204)


# ── Search ───────────────────────────────────────────────────────────────────

# Free-text fields searched per type, in addition to the title.
SEARCH_FIELDS = {
    "course": ["description"],
    "geacademy": ["excerpt", "topic"],
    "research": ["excerpt", "category"],
    "whitepaper": ["description", "category"],
    "tender": ["description", "authority", "sector"],
    "video": ["excerpt", "category"],
    "podcast": ["description", "guest", "category"],
    "blog": ["excerpt"],
}
GATED_TYPES = {"course", "video", "podcast", "blog"}  # carry access/price
TIMED_TYPES = {"video", "podcast"}  # carry duration_seconds


class SearchParamsSerializer(serializers.Serializer):
    q = serializers.CharField(required=False, allow_blank=True, max_length=100)
    type = serializers.ChoiceField(choices=list(TYPES), required=False)
    topic = serializers.SlugField(required=False)
    level = serializers.ChoiceField(choices=["beginner", "intermediate", "advanced"], required=False)
    access = serializers.ChoiceField(choices=["free", "members", "paid"], required=False)
    max_minutes = serializers.IntegerField(required=False, min_value=1)
    limit = serializers.IntegerField(required=False, min_value=1, max_value=SEARCH_MAX_LIMIT, default=20)
    offset = serializers.IntegerField(required=False, min_value=0, default=0)


def _search_type(type_key, params):
    """Matching objects of one type, newest first, or None when a filter rules the type out."""
    q, topic, level, access, max_minutes = (
        params.get("q", "").strip(), params.get("topic"), params.get("level"), params.get("access"), params.get("max_minutes"),
    )
    if topic and type_key == "tender":
        return None
    if level and type_key not in ("course", "geacademy"):
        return None
    if access in ("members", "paid") and type_key not in GATED_TYPES:
        return None
    if max_minutes and type_key not in TIMED_TYPES:
        return None

    qs = queryset(type_key)
    if q:
        match = Q(title__icontains=q)
        for field in SEARCH_FIELDS[type_key]:
            match |= Q(**{f"{field}__icontains": q})
        if type_key != "tender":
            match |= Q(topics__name__icontains=q)
        qs = qs.filter(match)
    if topic:
        qs = qs.filter(topics__slug=topic)
    if level:
        qs = qs.filter(level=level) if type_key == "course" else qs.filter(difficulty__iexact=level)
    if access and type_key in GATED_TYPES:
        qs = qs.filter(access=access)
    if max_minutes:
        qs = qs.filter(duration_seconds__lte=max_minutes * 60)
    order = "-updated_at" if type_key == "course" else ("deadline" if type_key == "tender" else "-date")
    return qs.distinct().order_by(order)[:SEARCH_PER_TYPE]


class SearchView(APIView):
    """
    GET /api/discovery/search/?q=&type=&topic=&level=&access=&max_minutes=&limit=&offset=
    Searches courses and every content type. Results whose title matches come
    first, then newest. `counts` gives the number of matches per type (for tabs).
    """
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "search"

    def get(self, request):
        params = SearchParamsSerializer(data=request.query_params)
        params.is_valid(raise_exception=True)
        p = params.validated_data
        q = p.get("q", "").strip()

        results, counts = [], {}
        for type_key in TYPES:
            objects = _search_type(type_key, p)
            if objects is None:
                continue
            found = cards(type_key, objects)
            counts[type_key] = len(found)
            if not p.get("type") or p["type"] == type_key:
                results += found

        needle = q.lower()
        results.sort(key=lambda c: c["date"] or "", reverse=True)
        if needle:
            results.sort(key=lambda c: needle not in c["title"].lower())  # stable: title matches first

        if q and p["offset"] == 0 and len(q) >= 2:
            SearchQuery.objects.create(
                query=q.lower()[:100], result_count=len(results),
                user=request.user if request.user.is_authenticated else None,
            )
        page = results[p["offset"]: p["offset"] + p["limit"]]
        return Response({"count": len(results), "counts": counts, "results": page})


class TrendingSearchesView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response(home.trending_searches())


# ── Home ─────────────────────────────────────────────────────────────────────

class HomeView(APIView):
    """Everything the public GeLearn home page shows, in one call."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response(home.public_home())


class MyHomeView(APIView):
    """The signed-in sections: continue learning, this week, recommendations."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(home.personal_home(request.user))
