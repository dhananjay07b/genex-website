"""
Data for GeLearn's browse pages: topics, career roles, Leading Professionals,
companies and live sessions. Same card shapes as the home page (cards.py).
"""
from datetime import timedelta

from django.db.models import Count, F, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone

from accounts.models import User
from learning.models import CareerRole, LiveSession, Playlist
from learning.queries import published_courses
from organizations.models import Company
from pages.models import CaseStudy, PodcastEpisode, TechArticle, Topic, VideoItem, Whitepaper

from .cards import cards, person_card, queryset
from .home import live_session_card, topic_groups

LEVELS = ["beginner", "intermediate", "advanced"]


def _topic_ref(topic):
    return {"id": topic.id, "name": topic.name, "slug": topic.slug}


def _image_url(obj):
    return obj.image.file.url if getattr(obj, "image_id", None) else None


# ── Professionals ────────────────────────────────────────────────────────────

def professional_card(user):
    return {
        **person_card(user),
        "rating": str(user.gelearn_rating) if user.gelearn_rating is not None else None,
        "featured": user.is_featured,
        "expertise": [_topic_ref(t) for t in user.expertise.all()[:3]],
    }


def professionals(topic_ids=None, limit=None):
    """Professionals, featured first (in editorial order), then by rating, then name."""
    qs = (
        User.objects.filter(account_type=User.ACCOUNT_PROFESSIONAL, is_active=True)
        .select_related("avatar", "company__logo").prefetch_related("expertise")
        .order_by("-is_featured", "featured_order", F("gelearn_rating").desc(nulls_last=True), "display_name")
    )
    if topic_ids is not None:
        qs = qs.filter(expertise__in=topic_ids).distinct()
    if limit:
        qs = qs[:limit]
    return [professional_card(u) for u in qs]


# ── Topics ───────────────────────────────────────────────────────────────────

def topic_detail(slug):
    topic = get_object_or_404(Topic.objects.select_related("group", "image"), slug=slug)
    courses = published_courses().filter(topics=topic).distinct()
    reading = (
        cards("geacademy", queryset("geacademy").filter(topics=topic).order_by("-date")[:4])
        + cards("research", queryset("research").filter(topics=topic).order_by("-date")[:4])
        + cards("whitepaper", queryset("whitepaper").filter(topics=topic).order_by("-date")[:4])
    )
    media = (
        cards("video", queryset("video").filter(topics=topic).order_by("-date")[:4])
        + cards("podcast", queryset("podcast").filter(topics=topic).order_by("-date")[:4])
    )
    now = timezone.now()
    sessions = [
        live_session_card(s) for s in LiveSession.objects.filter(is_published=True, topics=topic, starts_at__gte=now - timedelta(hours=4))
        .select_related("speaker__avatar", "speaker__company__logo", "company__logo", "image").prefetch_related("topics").order_by("starts_at")
        if s.ends_at >= now
    ][:4]
    related = (
        Topic.objects.filter(group=topic.group).exclude(pk=topic.pk).order_by("sort_order", "name")
        if topic.group_id else Topic.objects.none()
    )
    return {
        "id": topic.id,
        "name": topic.name,
        "slug": topic.slug,
        "description": topic.description,
        "image_url": _image_url(topic),
        "group": topic.group.name if topic.group_id else None,
        "counts": {
            "courses": courses.count(),
            "reading": sum(M.objects.filter(topics=topic).count() for M in (TechArticle, CaseStudy, Whitepaper)),
            "media": sum(M.objects.filter(topics=topic).count() for M in (VideoItem, PodcastEpisode)),
            "experts": User.objects.filter(account_type=User.ACCOUNT_PROFESSIONAL, is_active=True, expertise=topic).count(),
        },
        "popular_courses": cards("course", courses.order_by("-enrolled_count", "-updated_at")[:8]),
        "beginner_courses": cards("course", courses.filter(level="beginner").order_by("-enrolled_count")[:4]),
        "reading": sorted(reading, key=lambda c: c["date"] or "", reverse=True)[:8],
        "media": sorted(media, key=lambda c: c["date"] or "", reverse=True)[:8],
        "live_sessions": sessions,
        "experts": professionals(topic_ids=[topic.pk], limit=6),
        "related": [_topic_ref(t) for t in related],
    }


def all_topics():
    return {"groups": topic_groups()}


# ── Career roles ─────────────────────────────────────────────────────────────

def _published_role_courses(role):
    return published_courses().filter(roles=role).distinct()


def role_card(role):
    return {
        "id": role.id, "name": role.name, "slug": role.slug, "summary": role.summary,
        "image_url": _image_url(role),
        "course_count": getattr(role, "course_count", None),
    }


def roles_with_counts():
    return CareerRole.objects.select_related("image").annotate(
        course_count=Count("courses", filter=Q(courses__status=Playlist.STATUS_PUBLISHED), distinct=True),
    )


def all_roles():
    return [role_card(r) for r in roles_with_counts()]


def role_detail(slug):
    role = get_object_or_404(CareerRole.objects.select_related("image").prefetch_related("topics"), slug=slug)
    courses = _published_role_courses(role)
    skills = list(role.topics.order_by("name"))
    by_level = [
        {"level": level, "courses": cards("course", courses.filter(level=level).order_by("-enrolled_count")[:6])}
        for level in LEVELS
    ]
    unlevelled = cards("course", courses.filter(level="").order_by("-enrolled_count")[:6])
    if unlevelled:
        by_level.append({"level": "", "courses": unlevelled})
    pros = professionals(topic_ids=[t.pk for t in skills], limit=6) if skills else []
    return {
        **role_card(role),
        "course_count": courses.count(),
        "duties": role.duty_list,
        "skills": [_topic_ref(t) for t in skills],
        "courses_by_level": by_level,
        "starting_level": next((group["level"] for group in by_level if group["courses"]), ""),
        "professionals": pros,
        "professional_count": len(pros),
        "other_roles": [role_card(r) for r in roles_with_counts().exclude(pk=role.pk)],
    }


# ── Companies ────────────────────────────────────────────────────────────────

def company_counts(company):
    """What a company has on GeLearn: live courses (its own and its Professionals'), reading, whitepapers, verified experts."""
    return {
        "courses": Playlist.objects.filter(status=Playlist.STATUS_PUBLISHED).filter(
            Q(company=company) | Q(owner__company=company, company__isnull=True)).count(),
        "reading": TechArticle.objects.filter(company=company).count() + CaseStudy.objects.filter(company=company).count(),
        "whitepapers": Whitepaper.objects.filter(company=company).count(),
        "experts": User.objects.filter(account_type=User.ACCOUNT_PROFESSIONAL, company=company,
                                       company_verified=True, is_active=True).count(),
    }


def companies_with_counts():
    return [
        {
            "name": company.name,
            "slug": company.slug,
            "logo_url": company.logo_url,
            "description": company.description,
            "counts": company_counts(company),
        }
        for company in Company.objects.filter(is_active=True).select_related("logo").order_by("name")
    ]


# ── Live sessions ────────────────────────────────────────────────────────────

def live_sessions(when=None):
    now = timezone.now()
    qs = (
        LiveSession.objects.filter(is_published=True, starts_at__gte=now - timedelta(hours=4))
        .select_related("speaker__avatar", "speaker__company__logo", "company__logo", "image")
        .prefetch_related("topics").order_by("starts_at")
    )
    if when == "week":
        qs = qs.filter(starts_at__lt=now + timedelta(days=7))
    elif when == "month":
        qs = qs.filter(starts_at__lt=now + timedelta(days=31))
    return [live_session_card(s) for s in qs if s.ends_at >= now]


# ── Landing-page figures ─────────────────────────────────────────────────────

def platform_stats():
    return {
        "verified_professionals": User.objects.filter(account_type=User.ACCOUNT_PROFESSIONAL, company_verified=True, is_active=True).count(),
        "professionals": User.objects.filter(account_type=User.ACCOUNT_PROFESSIONAL, is_active=True).count(),
        "courses": Playlist.objects.filter(status=Playlist.STATUS_PUBLISHED).count(),
        "companies": Company.objects.filter(is_active=True).count(),
        "research_and_whitepapers": CaseStudy.objects.count() + Whitepaper.objects.count(),
        "learners": User.objects.filter(account_type=User.ACCOUNT_LEARNER, is_active=True).count(),
    }
