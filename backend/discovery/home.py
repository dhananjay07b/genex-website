"""
The sections of GeLearn's home page, each as plain data. Public sections
are the same for everyone; personal sections need a signed-in user.
"""
from datetime import timedelta

from django.contrib.contenttypes.models import ContentType
from django.db.models import Count, Q
from django.utils import timezone

from accounts.models import User
from engagement.models import SavedItem
from learning.models import CareerRole, Enrollment, ItemProgress, LiveSession, Playlist
from learning.queries import published_courses
from organizations.models import Company
from pages.models import GeLearnIndexPage, Testimonial, Topic, TopicGroup

from .cards import MODEL_TYPES, TYPE_MODELS, card_for, cards, person_card, queryset
from .models import SearchQuery, ViewEvent

TRENDING_DAYS = 7
MIN_TESTIMONIALS = 3
QUICK_VIDEO_SECONDS = 20 * 60


# ── Layout (the sections editors arrange on the GeLearn index page) ─────────

def _course_rail(value):
    courses = published_courses()
    source = value["source"]
    if source == "free":
        courses = courses.filter(access=Playlist.ACCESS_FREE).order_by("-featured", "-enrolled_count", "-updated_at")
    elif source == "featured":
        courses = courses.filter(featured=True).order_by("-updated_at")
    elif source == "newest":
        courses = courses.order_by("-updated_at")
    elif source == "topic":
        courses = courses.filter(topics=value["topic"]).order_by("-enrolled_count") if value["topic"] else courses.none()
    elif source == "role":
        courses = courses.filter(roles=value["role"]).order_by("-enrolled_count") if value["role"] else courses.none()
    else:  # popular
        courses = courses.order_by("-enrolled_count", "-updated_at")
    return cards("course", courses.distinct()[: value["limit"]])


def _content_rail(value):
    type_key = value["content_type"]
    objects = queryset(type_key)
    if value["topic"]:
        objects = objects.filter(topics=value["topic"])
    if value["max_minutes"] and type_key in ("video", "podcast"):
        objects = objects.filter(duration_seconds__lte=value["max_minutes"] * 60)
    return cards(type_key, objects.distinct().order_by("-date")[: value["limit"]])


RAIL_RESOLVERS = {"course_rail": _course_rail, "content_rail": _content_rail}


def layout(stream):
    """
    The arranged sections: [{type, id, value}], where `value` is the editor's
    text and settings (images as {url, …}). Course and content rows also carry
    `items`; every other section takes its data from the matching top-level key.
    """
    representation = stream.stream_block.get_api_representation(stream)
    sections = []
    for block, section in zip(stream, representation):
        resolve = RAIL_RESOLVERS.get(block.block_type)
        if resolve:
            section["items"] = resolve(block.value)
        sections.append(section)
    return sections


def home_page():
    return GeLearnIndexPage.objects.live().first()


# ── Public ───────────────────────────────────────────────────────────────────

def leading_professionals(limit=8):
    people = (
        User.objects.filter(is_featured=True, account_type=User.ACCOUNT_PROFESSIONAL, is_active=True)
        .select_related("avatar", "company__logo").prefetch_related("expertise")
        .order_by("featured_order", "display_name")[:limit]
    )
    return [
        {
            **person_card(user),
            "rating": str(user.gelearn_rating) if user.gelearn_rating is not None else None,
            "expertise": [t.name for t in user.expertise.all()[:3]],
        }
        for user in people
    ]


def popular_courses(limit=8):
    return cards("course", published_courses().order_by("-enrolled_count", "-updated_at")[:limit])


def courses_by_role(per_role=4):
    roles = CareerRole.objects.select_related("image").annotate(
        course_count=Count("courses", filter=Q(courses__status=Playlist.STATUS_PUBLISHED), distinct=True),
    )
    return [
        {
            "id": role.id, "name": role.name, "slug": role.slug, "summary": role.summary,
            "image_url": role.image.file.url if role.image_id else None,
            "course_count": role.course_count,
            "courses": cards("course", published_courses().filter(roles=role).order_by("-enrolled_count")[:per_role]),
        }
        for role in roles
    ]


def latest(type_key, limit, order="-date"):
    return cards(type_key, queryset(type_key).order_by(order)[:limit])


def library_tabs(per_tab=4):
    """The "More than courses" tabs."""
    return {
        "geacademy": latest("geacademy", per_tab),
        "research": latest("research", per_tab),
        "whitepaper": latest("whitepaper", per_tab),
        "tender": cards("tender", queryset("tender").filter(status="Open").order_by("deadline")[:per_tab]),
        "video": latest("video", per_tab),
        "podcast": latest("podcast", per_tab),
    }


def _cards_for_refs(refs, limit):
    """[(model_name, object_id), …] in rank order → cards, skipping anything no longer public."""
    by_type = {}
    for model_name, object_id in refs:
        by_type.setdefault(MODEL_TYPES[model_name], []).append(object_id)
    found = {}
    for type_key, ids in by_type.items():
        for obj in queryset(type_key).filter(pk__in=ids):
            found[(type_key, obj.pk)] = obj
    result = []
    for model_name, object_id in refs:
        type_key = MODEL_TYPES[model_name]
        obj = found.get((type_key, object_id))
        if obj is not None:
            result.append(card_for(type_key, obj))
        if len(result) == limit:
            break
    return result


def trending(limit=8):
    """Most viewed in the last 7 days; topped up with the newest content when views are thin."""
    since = timezone.now() - timedelta(days=TRENDING_DAYS)
    ranked = (
        ViewEvent.objects.filter(viewed_at__gte=since, content_type__model__in=MODEL_TYPES)
        .values("content_type__model", "object_id").annotate(n=Count("pk")).order_by("-n")[: limit * 3]
    )
    result = _cards_for_refs([(r["content_type__model"], r["object_id"]) for r in ranked], limit)
    if len(result) < limit:
        seen = {(c["type"], c["id"]) for c in result}
        fresh = sorted(
            latest("geacademy", limit) + latest("research", limit) + latest("video", limit),
            key=lambda c: c["date"] or "", reverse=True,
        )
        result += [c for c in fresh if (c["type"], c["id"]) not in seen][: limit - len(result)]
    return result


def live_session_card(session):
    speaker = (
        person_card(session.speaker) if session.speaker_id
        else {"username": None, "display_name": session.speaker_name, "avatar_url": None,
              "role_title": session.speaker_role, "company": None}
    )
    return {
        "id": session.pk,
        "slug": session.slug,
        "title": session.title,
        "description": session.description,
        "starts_at": session.starts_at.isoformat(),
        "ends_at": session.ends_at.isoformat(),
        "duration_minutes": session.duration_minutes,
        "speaker": speaker,
        # Null means Genex is hosting.
        "company": {"name": session.company.name, "slug": session.company.slug, "logo_url": session.company.logo_url,
                    "verified": True} if session.company_id else None,
        "registration_url": session.registration_url,
        "image_url": session.image.file.url if session.image_id else None,
        "topics": [{"id": t.id, "name": t.name, "slug": t.slug} for t in session.topics.all()],
    }


def upcoming_live_sessions(limit=4):
    now = timezone.now()
    # Anything that started in the last 4 hours might still be running; ends_at decides.
    candidates = (
        LiveSession.objects.filter(is_published=True, starts_at__gte=now - timedelta(hours=4))
        .select_related("speaker__avatar", "speaker__company__logo", "company__logo", "image")
        .prefetch_related("topics").order_by("starts_at")
    )
    return [live_session_card(s) for s in candidates if s.ends_at >= now][:limit]


def testimonials():
    rows = list(Testimonial.objects.filter(is_active=True).select_related("photo"))
    if len(rows) < MIN_TESTIMONIALS:
        return []
    return [
        {"id": t.pk, "quote": t.quote, "name": t.name, "role": t.role, "company_name": t.company_name,
         "photo_url": t.photo.file.url if t.photo_id else None}
        for t in rows
    ]


def companies(limit=16):
    return [
        {"name": c.name, "slug": c.slug, "logo_url": c.logo_url}
        for c in Company.objects.filter(is_active=True).select_related("logo").order_by("name")[:limit]
    ]


def stats():
    return {
        "courses": Playlist.objects.filter(status=Playlist.STATUS_PUBLISHED).count(),
        "experts": User.objects.filter(account_type=User.ACCOUNT_PROFESSIONAL, company_verified=True, is_active=True).count(),
        "companies": Company.objects.filter(is_active=True).count(),
    }


def topic_groups():
    """The Explore menu's Topics pane: grouped topics only, in editorial order."""
    groups = TopicGroup.objects.prefetch_related("topics").order_by("sort_order", "name")
    return [
        {"name": g.name, "topics": [{"id": t.id, "name": t.name, "slug": t.slug}
                                    for t in sorted(g.topics.all(), key=lambda t: (t.sort_order, t.name))]}
        for g in groups
    ]


def trending_searches(limit=6):
    since = timezone.now() - timedelta(days=TRENDING_DAYS)
    rows = (
        SearchQuery.objects.filter(created_at__gte=since, result_count__gt=0)
        .values("query").annotate(n=Count("pk")).order_by("-n", "query")[:limit]
    )
    return [r["query"] for r in rows]


def public_home():
    page = home_page()
    return {
        "layout": layout(page.home_sections) if page else [],
        "professionals": leading_professionals(),
        "popular_courses": popular_courses(),
        "new_geacademy": latest("geacademy", 6),
        "trending": trending(),
        "roles": courses_by_role(),
        "library": library_tabs(),
        "live_sessions": upcoming_live_sessions(),
        "testimonials": testimonials(),
        "companies": companies(),
        "stats": stats(),
        "topic_groups": topic_groups(),
        "trending_searches": trending_searches(),
    }


# ── Personal ─────────────────────────────────────────────────────────────────

def _course_progress(user, course):
    items = list(course.items.select_related("video", "post"))
    done = set(ItemProgress.objects.filter(user=user, item__playlist=course).values_list("item_id", flat=True))
    next_item = next((i for i in items if i.pk not in done), None)
    total = len(items)
    return {
        "completed": len(done),
        "total": total,
        "percent": round(len(done) * 100 / total) if total else 0,
        "next_item": {
            "item_id": next_item.pk,
            "kind": next_item.kind,
            "title": next_item.target.title,
            "meta": next_item.video.duration if next_item.video_id else "",
        } if next_item else None,
    }


def continue_learning(user):
    """The unfinished enrolled course the user touched most recently, with the next lesson."""
    enrollments = Enrollment.objects.filter(user=user, playlist__status=Playlist.STATUS_PUBLISHED)
    best, best_at = None, None
    for enrollment in enrollments:
        last_progress = (
            ItemProgress.objects.filter(user=user, item__playlist_id=enrollment.playlist_id)
            .order_by("-completed_at").values_list("completed_at", flat=True).first()
        )
        active_at = max(filter(None, [enrollment.enrolled_at, last_progress]))
        if best_at is None or active_at > best_at:
            course = published_courses().get(pk=enrollment.playlist_id)
            progress = _course_progress(user, course)
            if progress["total"] and progress["completed"] < progress["total"]:
                best, best_at = (course, progress), active_at
    if best is None:
        return None
    course, progress = best
    return {"course": card_for("course", course), **progress}


def this_week(user):
    today = timezone.localdate()
    monday = today - timedelta(days=today.weekday())
    counts = {}
    for done_at in ItemProgress.objects.filter(user=user, completed_at__date__gte=monday).values_list("completed_at", flat=True):
        day = timezone.localtime(done_at).date()
        counts[day] = counts.get(day, 0) + 1
    days = [{"date": (monday + timedelta(days=i)).isoformat(), "count": counts.get(monday + timedelta(days=i), 0)}
            for i in range(7)]
    return {"days": days, "total": sum(d["count"] for d in days)}


def recently_viewed(user, limit=6):
    refs, seen = [], set()
    for model_name, object_id in (
        ViewEvent.objects.filter(user=user, content_type__model__in=MODEL_TYPES)
        .values_list("content_type__model", "object_id")[:50]
    ):
        if (model_name, object_id) not in seen:
            seen.add((model_name, object_id))
            refs.append((model_name, object_id))
    return _cards_for_refs(refs, limit)


def _viewed_topic_ids(user):
    """Topics of what the user enrolled in or recently viewed."""
    topic_ids = set(Topic.objects.filter(courses__enrollments__user=user).values_list("pk", flat=True))
    recent = ViewEvent.objects.filter(user=user, content_type__model__in=MODEL_TYPES).values_list(
        "content_type__model", "object_id")[:30]
    by_model = {}
    for model_name, object_id in recent:
        by_model.setdefault(model_name, set()).add(object_id)
    for model_name, ids in by_model.items():
        model = ContentType.objects.get(app_label__in=["pages", "learning"], model=model_name).model_class()
        if hasattr(model, "topics"):
            topic_ids |= set(model.topics.through.objects.filter(
                **{f"{model._meta.model_name}_id__in": ids}).values_list("topic_id", flat=True))
    return topic_ids


def because_you_took(user, anchor, limit=4):
    """Courses sharing topics with the course the user is taking."""
    topic_ids = list(anchor.topics.values_list("pk", flat=True))
    if not topic_ids:
        return []
    enrolled = Enrollment.objects.filter(user=user).values_list("playlist_id", flat=True)
    courses = (
        published_courses().filter(topics__in=topic_ids).exclude(pk__in=enrolled).exclude(owner=user)
        .distinct().order_by("-enrolled_count")[:limit]
    )
    return cards("course", courses)


def similar_to_activity(user, limit=6):
    topic_ids = _viewed_topic_ids(user)
    if not topic_ids:
        return []
    viewed = {(m, i) for m, i in ViewEvent.objects.filter(user=user).values_list("content_type__model", "object_id")}
    pool = []
    for type_key in ("geacademy", "research", "video", "podcast", "course"):
        for obj in queryset(type_key).filter(topics__in=topic_ids).distinct().order_by("-pk")[:limit]:
            if (TYPE_MODELS[type_key], obj.pk) not in viewed:
                pool.append(card_for(type_key, obj))
    pool.sort(key=lambda c: c["date"] or "", reverse=True)
    return pool[:limit]


def closing_tenders(limit=4):
    today = timezone.localdate()
    return cards("tender", queryset("tender").filter(status="Open", deadline__gte=today).order_by("deadline")[:limit])


def quick_videos(limit=4):
    return cards("video", queryset("video").filter(duration_seconds__lte=QUICK_VIDEO_SECONDS).order_by("-date")[:limit])


def personal_home(user):
    current = continue_learning(user)
    anchor = None
    if current:
        anchor = Playlist.objects.get(slug=current["course"]["slug"])
    else:
        latest_enrollment = Enrollment.objects.filter(user=user).select_related("playlist").first()
        anchor = latest_enrollment.playlist if latest_enrollment else None
    goal = user.career_goal
    page = home_page()
    return {
        "layout": layout(page.member_sections) if page else [],
        "continue": current,
        "week": this_week(user),
        "enrolled_count": Enrollment.objects.filter(user=user).count(),
        "saved_count": SavedItem.objects.filter(user=user).count(),
        "career_goal": {"id": goal.id, "name": goal.name, "slug": goal.slug} if goal else None,
        "goal_courses": cards("course", published_courses().filter(roles=goal).order_by("-enrolled_count")[:4]) if goal else [],
        "because": {"course": {"title": anchor.title, "slug": anchor.slug},
                    "courses": because_you_took(user, anchor)} if anchor else None,
        "recently_viewed": recently_viewed(user),
        "similar": similar_to_activity(user),
        "closing_tenders": closing_tenders(),
        "quick_videos": quick_videos(),
    }
