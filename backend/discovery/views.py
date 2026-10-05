from datetime import timedelta

from django.contrib.contenttypes.models import ContentType
from django.db.models import Q
from django.utils import timezone
from rest_framework import permissions, serializers
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from organizations.models import Company
from pages.models import Topic

from . import home, pages
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


LENGTH_BUCKETS = [(10, "Up to 10 minutes"), (20, "Up to 20 minutes"), (60, "Up to 1 hour")]
FACETS = ["topic", "level", "access", "max_minutes", "publisher"]


class SearchParamsSerializer(serializers.Serializer):
    q = serializers.CharField(required=False, allow_blank=True, max_length=100)
    type = serializers.ChoiceField(choices=list(TYPES), required=False)
    topic = serializers.SlugField(required=False)
    level = serializers.ChoiceField(choices=["beginner", "intermediate", "advanced"], required=False)
    access = serializers.ChoiceField(choices=["free", "members", "paid"], required=False)
    max_minutes = serializers.IntegerField(required=False, min_value=1)
    publisher = serializers.SlugField(required=False, help_text="A company slug, or 'genex' for Genex editorial content.")
    sort = serializers.ChoiceField(choices=["best", "newest", "popular"], required=False, default="best")
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


GENEX_NAME = "Genex Technocrats"


def _genex_slug():
    """Genex editorial content (no company set) is filed under Genex's own company record when it exists."""
    company = Company.objects.filter(name__iexact=GENEX_NAME, is_active=True).values_list("slug", flat=True).first()
    return company or "genex"


def _publisher_of(card, genex_slug):
    """(company slug, name) a card is published under; editorial content counts as Genex."""
    company = card["company"] or (card["author"] or {}).get("company")
    if company:
        return company.get("slug"), company["name"]
    return (genex_slug, GENEX_NAME) if not card["author"] else (None, None)


def _matches(params):
    """Every matching card, all types, before the type tab, sorting and paging."""
    found = []
    for type_key in TYPES:
        objects = _search_type(type_key, params)
        if objects is not None:
            found += cards(type_key, objects)
    if params.get("publisher"):
        genex_slug = _genex_slug()
        found = [c for c in found if _publisher_of(c, genex_slug)[0] == params["publisher"]]
    return found


def _facet_counts(params, results_without):
    """Coursera-style counts: each group is counted with every other active filter applied, but not its own."""
    topics, levels, access, lengths, publishers = {}, {}, {}, {}, {}
    for card in results_without("topic"):
        for t in card["topics"]:
            name_count = topics.setdefault(t["slug"], {"value": t["slug"], "label": t["name"], "count": 0})
            name_count["count"] += 1
    for card in results_without("level"):
        if card["level"]:
            levels[card["level"]] = levels.get(card["level"], 0) + 1
    for card in results_without("access"):
        if card["type"] in GATED_TYPES:
            access[card["access"]] = access.get(card["access"], 0) + 1
    timed = [c for c in results_without("max_minutes") if c["type"] in TIMED_TYPES and c.get("duration_seconds")]
    for minutes, _ in LENGTH_BUCKETS:
        lengths[minutes] = sum(1 for c in timed if c["duration_seconds"] <= minutes * 60)
    genex_slug = _genex_slug()
    for card in results_without("publisher"):
        slug, name = _publisher_of(card, genex_slug)
        if slug:
            entry = publishers.setdefault(slug, {"value": slug, "label": name, "count": 0})
            entry["count"] += 1
    return {
        "topic": sorted(topics.values(), key=lambda r: -r["count"])[:10],
        "level": [{"value": v, "label": v.title(), "count": levels.get(v, 0)} for v in ("beginner", "intermediate", "advanced")],
        "access": [{"value": v, "label": label, "count": access.get(v, 0)}
                   for v, label in (("free", "Free"), ("members", "Members only"), ("paid", "Paid"))],
        "max_minutes": [{"value": str(m), "label": label, "count": lengths[m]} for m, label in LENGTH_BUCKETS],
        "publisher": sorted(publishers.values(), key=lambda r: -r["count"]),
    }


class SearchView(APIView):
    """
    GET /api/discovery/search/?q=&type=&topic=&level=&access=&max_minutes=&publisher=&sort=&limit=&offset=
    Searches courses and every content type. `counts` gives matches per type
    (for tabs) and `facets` the count behind each filter option.
    """
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "search"

    def get(self, request):
        params = SearchParamsSerializer(data=request.query_params)
        params.is_valid(raise_exception=True)
        p = params.validated_data
        q = p.get("q", "").strip()

        matches = _matches(p)
        counts = {}
        for card in matches:
            counts[card["type"]] = counts.get(card["type"], 0) + 1
        results = [c for c in matches if not p.get("type") or c["type"] == p["type"]]

        if p["sort"] == "newest":
            results.sort(key=lambda c: c["date"] or "", reverse=True)
        elif p["sort"] == "popular":
            results.sort(key=lambda c: (c.get("enrolled") or 0, c["date"] or ""), reverse=True)
        else:
            results.sort(key=lambda c: c["date"] or "", reverse=True)
            needle = q.lower()
            if needle:
                results.sort(key=lambda c: needle not in c["title"].lower())  # stable: title matches first

        def results_without(facet):
            if not p.get(facet):
                return [c for c in matches if not p.get("type") or c["type"] == p["type"]]
            others = {k: v for k, v in p.items() if k != facet}
            return [c for c in _matches(others) if not p.get("type") or c["type"] == p["type"]]

        if q and p["offset"] == 0 and len(q) >= 2:
            SearchQuery.objects.create(
                query=q.lower()[:100], result_count=len(results),
                user=request.user if request.user.is_authenticated else None,
            )
        page = results[p["offset"]: p["offset"] + p["limit"]]
        return Response({
            "count": len(results), "counts": counts, "total": len(matches),
            "facets": _facet_counts(p, results_without), "results": page,
        })


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


class ExploreMenuView(APIView):
    """The header's Explore menu: grouped topics, career roles and companies."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response(home.explore_menu())


class MyHomeView(APIView):
    """The signed-in sections: continue learning, this week, recommendations."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(home.personal_home(request.user))


# ── Browse pages ─────────────────────────────────────────────────────────────

class TopicListView(APIView):
    """All topics, grouped as in the Explore menu."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response(pages.all_topics())


class TopicDetailView(APIView):
    """One topic's page: description, counts, courses, reading, media, live sessions, experts, related topics."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        return Response(pages.topic_detail(slug))


class RoleListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response(pages.all_roles())


class RoleDetailView(APIView):
    """One career role's page: duties, skills, courses by level, Professionals, other roles."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        return Response(pages.role_detail(slug))


class ProfessionalListView(APIView):
    """Leading Professionals, featured first. `?topic=<slug>` limits to that area of expertise."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        slug = request.query_params.get("topic")
        topic_ids = list(Topic.objects.filter(slug=slug).values_list("pk", flat=True)) if slug else None
        return Response(pages.professionals(topic_ids=topic_ids))


class CompanyListView(APIView):
    """Active companies with what each has published."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response(pages.companies_with_counts())


class LiveSessionListView(APIView):
    """Upcoming live sessions. `?when=week` or `?when=month` narrows the range."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response(pages.live_sessions(request.query_params.get("when")))


LANDING_FIELDS = {"professionals": "for_professionals", "companies": "for_companies"}


class LandingView(APIView):
    """A landing page's CMS sections (`layout`) plus the live figures its hero can show."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, audience):
        field = LANDING_FIELDS.get(audience)
        if field is None:
            return Response({"detail": "Not found."}, status=404)
        page = home.home_page()
        return Response({
            "layout": home.layout(getattr(page, field)) if page else [],
            "stats": pages.platform_stats(),
        })
