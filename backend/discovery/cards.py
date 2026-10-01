"""
One card shape for every kind of GeLearn content, so home rails and search
results render the same way:

  {type, id, title, excerpt, image_url, path, date, meta, level, topics,
   access, price, currency, company, author, ...type-specific extras}

`type` is the public key used in URLs and the API (course, geacademy,
research, whitepaper, tender, video, podcast, blog).
"""
from django.utils import timezone

from accounts.roles import display_company, display_publisher
from learning.queries import published_courses
from pages.models import BlogPost, CaseStudy, PodcastEpisode, TechArticle, Tender, VideoItem, Whitepaper

EXCERPT_LENGTH = 220


def _excerpt(text):
    text = (text or "").strip()
    return text if len(text) <= EXCERPT_LENGTH else text[: EXCERPT_LENGTH - 1].rsplit(" ", 1)[0] + "…"


def _image(obj, field="image"):
    image = getattr(obj, field, None)
    return image.file.url if image else None


def _topics(obj):
    if not hasattr(obj, "topics"):  # tenders aren't tagged with topics
        return []
    return [{"id": t.id, "name": t.name, "slug": t.slug} for t in obj.topics.all()]


def _access(obj):
    return {
        "access": obj.access,
        "price": str(obj.price) if obj.price is not None else None,
        "currency": obj.currency,
    }


def person_card(user):
    """A Professional or author as shown on cards: name, photo, role, company."""
    return {
        "username": user.username,
        "display_name": user.display_name or user.username,
        "avatar_url": user.avatar.file.url if user.avatar_id else None,
        "role_title": user.role_title,
        "company": display_company(user),
    }


def _submitter(obj):
    submission = getattr(obj, "submission_source", None)
    return person_card(submission.author) if submission is not None and submission.author_id else None


def _base(obj, type_key, path, *, excerpt="", meta="", date=None, image_url=None):
    return {
        "type": type_key,
        "id": obj.pk,
        "title": obj.title,
        "excerpt": _excerpt(excerpt),
        "image_url": image_url,
        "path": path,
        "date": date.isoformat() if date else None,
        "meta": meta,
        "level": "",
        "topics": _topics(obj),
        "access": "free",
        "price": None,
        "currency": "INR",
        "company": None,
        "author": None,
    }


def course_card(course):
    card = _base(course, "course", f"/courses/{course.slug}", excerpt=course.description,
                 date=course.updated_at.date(), image_url=_image(course, "cover"))
    lessons = getattr(course, "item_count", None)
    card.update(
        _access(course),
        slug=course.slug,
        meta=f"{lessons} lesson{'' if lessons == 1 else 's'}" if lessons is not None else "",
        level=course.level,
        lessons=lessons,
        video_minutes=round((getattr(course, "video_seconds", 0) or 0) / 60),
        enrolled=getattr(course, "enrolled_count", None),
        featured=course.featured,
        # Company Studio courses are by the company; a Professional's own course is by them (with their company).
        company=display_publisher(course.company) if course.company_id else None,
        author=None if course.company_id else person_card(course.owner),
    )
    return card


def geacademy_card(article):
    card = _base(article, "geacademy", f"/geacademy/{article.pk}", excerpt=article.excerpt,
                 meta=article.read_time, date=article.date, image_url=_image(article))
    card.update(level=article.difficulty.lower(), company=display_publisher(article.company) if article.company_id else None)
    return card


def research_card(study):
    card = _base(study, "research", f"/research/{study.pk}", excerpt=study.excerpt,
                 meta=study.read_time, date=study.date, image_url=_image(study))
    card.update(company=display_publisher(study.company) if study.company_id else None)
    return card


def whitepaper_card(paper):
    card = _base(paper, "whitepaper", "/whitepapers", excerpt=paper.description, meta=paper.pages, date=paper.date)
    card.update(
        company=display_publisher(paper.company) if paper.company_id else None,
        document_url=paper.document.url if paper.document_id else None,
    )
    return card


def tender_card(tender, today=None):
    today = today or timezone.localdate()
    days_left = (tender.deadline - today).days if tender.deadline else None
    card = _base(tender, "tender", "/policies-tenders", excerpt=tender.description, meta=tender.authority)
    card.update(
        company=display_publisher(tender.company) if tender.company_id else None,
        status=tender.status,
        sector=tender.sector,
        authority=tender.authority,
        deadline=tender.deadline.isoformat() if tender.deadline else None,
        days_left=days_left,
    )
    return card


def video_card(video):
    card = _base(video, "video", f"/videos/{video.pk}", excerpt=video.excerpt,
                 meta=video.duration, date=video.date, image_url=_image(video))
    card.update(_access(video), author=_submitter(video), duration_seconds=video.duration_seconds)
    return card


def podcast_card(episode):
    card = _base(episode, "podcast", f"/podcasts/{episode.pk}", excerpt=episode.description,
                 meta=episode.duration, date=episode.date, image_url=_image(episode))
    card.update(
        _access(episode),
        company=display_publisher(episode.company) if episode.company_id else None,
        guest=episode.guest,
        duration_seconds=episode.duration_seconds,
    )
    return card


def blog_card(post):
    card = _base(post, "blog", f"/blog/{post.pk}", excerpt=post.excerpt, date=post.date, image_url=_image(post))
    card.update(_access(post), author=_submitter(post))
    return card


_PUBLISHER = ("company__logo",)
_SUBMITTER = ("submission_source__author__avatar", "submission_source__author__company__logo")

# type key → (queryset of what the public can see, card builder)
TYPES = {
    "course": (published_courses, course_card),
    "geacademy": (lambda: TechArticle.objects.select_related("image", *_PUBLISHER).prefetch_related("topics"), geacademy_card),
    "research": (lambda: CaseStudy.objects.select_related("image", *_PUBLISHER).prefetch_related("topics"), research_card),
    "whitepaper": (lambda: Whitepaper.objects.select_related("document", *_PUBLISHER).prefetch_related("topics"), whitepaper_card),
    "tender": (lambda: Tender.objects.select_related(*_PUBLISHER), tender_card),
    "video": (lambda: VideoItem.objects.select_related("image", *_SUBMITTER).prefetch_related("topics"), video_card),
    "podcast": (lambda: PodcastEpisode.objects.select_related("image", *_PUBLISHER).prefetch_related("topics"), podcast_card),
    "blog": (lambda: BlogPost.objects.select_related("image", *_SUBMITTER).prefetch_related("topics"), blog_card),
}

# Model class → type key, for turning stored view events back into cards.
MODEL_TYPES = {
    "playlist": "course", "techarticle": "geacademy", "casestudy": "research", "whitepaper": "whitepaper",
    "tender": "tender", "videoitem": "video", "podcastepisode": "podcast", "blogpost": "blog",
}
TYPE_MODELS = {v: k for k, v in MODEL_TYPES.items()}


def queryset(type_key):
    return TYPES[type_key][0]()


def card_for(type_key, obj):
    return TYPES[type_key][1](obj)


def cards(type_key, objects):
    build = TYPES[type_key][1]
    return [build(obj) for obj in objects]
