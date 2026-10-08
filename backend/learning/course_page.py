"""
Everything the course page shows beyond the lesson list: modules with times,
instructors and the publisher with their numbers, the career-path steps, the
rating and first reviews, FAQs, learners' companies, and related courses.

Discovery helpers (cards, company counts) are imported inside functions:
discovery imports learning.serializers, so importing it at module level here
would be circular.
"""
from collections import Counter

from django.db.models import Count, Q

from accounts.models import User
from accounts.roles import display_company, display_publisher

from .models import CourseReview, Enrollment, Playlist
from .queries import published_courses
from .reviews import REVIEW_SELECT, review_block_reason, review_payload, with_progress

LEVELS = ["beginner", "intermediate", "advanced"]
FIRST_REVIEWS = 3
RELATED_PER_TAB = 4
# The learners' companies strip only shows once this many verified companies qualify.
MIN_LEARNER_COMPANIES = 3


def lesson_counts(items):
    """How many lessons of each kind, e.g. {"video": 10, "post": 8}."""
    return dict(Counter(item["kind"] for item in items))


def modules_payload(course, items):
    """Modules in order, each with its lesson ids and total minutes. Empty when the course has no modules."""
    rows = []
    for module in course.modules.all():
        mine = [item for item in items if item["module_id"] == module.pk]
        rows.append({
            "id": module.pk,
            "title": module.title,
            "summary": module.summary,
            "item_ids": [item["item_id"] for item in mine],
            "minutes": sum(item["minutes"] for item in mine),
        })
    return rows


def _teaching_stats(user):
    """Live courses this person owns (their own) or teaches (company courses), and how many learners those have."""
    courses = Playlist.objects.filter(status=Playlist.STATUS_PUBLISHED).filter(
        Q(owner=user, company__isnull=True) | Q(instructors=user)).distinct()
    learners = Enrollment.objects.filter(playlist__in=courses).values("user").distinct().count()
    return courses.count(), learners


def _person(user):
    course_count, learner_count = _teaching_stats(user)
    return {
        "username": user.username,
        "display_name": user.display_name or user.username,
        "avatar_url": user.avatar.file.url if user.avatar_id else None,
        "role_title": user.role_title,
        "years_experience": user.years_experience,
        "bio": user.bio,
        "company": display_company(user),
        "rating": str(user.gelearn_rating) if user.gelearn_rating is not None else None,
        "course_count": course_count,
        "learner_count": learner_count,
    }


def instructors_payload(course):
    """A Professional's course: its owner. A company course: the instructors it lists (still eligible), possibly none."""
    if course.company_id is None:
        return [_person(course.owner)]
    people = course.listed_instructors().select_related("avatar", "company__logo")
    return [_person(person) for person in people]


def publisher_payload(course):
    """
    "Offered by": the company of a company course, or a Professional's verified,
    listed company. None for a Professional with an unlisted or unverified company.
    """
    from discovery.pages import company_counts

    if course.company_id:
        company = course.company
    else:
        shown = display_company(course.owner)
        company = course.owner.company if shown and shown["verified"] and shown["slug"] else None
    card = display_publisher(company)
    if card is None:
        return None
    return {**card, "description": company.description, "counts": company_counts(company)}


def _course_ref(course):
    from discovery.cards import course_card
    return course_card(course)


def roles_payload(course):
    """
    Each career role the course is for, with its path: one course per level
    (this course at its own level, otherwise the role's most-enrolled live course).
    """
    rows = []
    for role in course.roles.all():
        role_courses = published_courses().filter(roles=role).exclude(pk=course.pk).distinct()
        path = []
        for level in LEVELS:
            if course.level == level:
                path.append({"level": level, "is_current": True, "course": _course_ref(published_courses().get(pk=course.pk))})
                continue
            other = role_courses.filter(level=level).order_by("-enrolled_count").first()
            if other is not None:
                path.append({"level": level, "is_current": False, "course": _course_ref(other)})
        rows.append({"id": role.pk, "name": role.name, "slug": role.slug, "summary": role.summary, "path": path})
    return rows


def first_reviews(course, lesson_count, viewer):
    reviews = with_progress(course.reviews.filter(status=CourseReview.STATUS_VISIBLE).select_related(*REVIEW_SELECT))[:FIRST_REVIEWS]
    team = bool(course.relation_to(viewer))
    return [review_payload(review, lesson_count, viewer, can_reply=team) for review in reviews]


def my_review_state(course, lesson_count, user):
    """For a signed-in viewer: their own review (if any) and whether they may write one."""
    if not user.is_authenticated:
        return None
    review = CourseReview.objects.filter(user=user, playlist=course).first()
    reason = review_block_reason(user, course)
    return {
        "review": review_payload(review, lesson_count, user) if review else None,
        "can_review": reason is None,
        "reason": reason or "",
    }


def learner_companies(course):
    """
    Verified companies of enrolled learners (names only, never people), shown
    once at least 3 qualify. Only Professionals carry a verified company.
    """
    company_ids = (
        User.objects.filter(enrollments__playlist=course, account_type=User.ACCOUNT_PROFESSIONAL,
                            company_verified=True, company__is_active=True)
        .values("company").annotate(n=Count("pk")).order_by("-n").values_list("company", flat=True)
    )
    from organizations.models import Company
    companies = {c.pk: c for c in Company.objects.filter(pk__in=list(company_ids)).select_related("logo")}
    cards = [display_publisher(companies[pk]) for pk in company_ids if pk in companies]
    return cards if len(cards) >= MIN_LEARNER_COMPANIES else []


def next_item_id(items, enrollment):
    """The first lesson an enrolled learner hasn't opened yet and can open (locked ones are skipped), in course order."""
    if not enrollment:
        return None
    done = set(enrollment["completed_item_ids"])
    return next((item["item_id"] for item in items if item["item_id"] not in done and not item["is_locked"]), None)


def related_courses(course):
    """
    Up to three tabs of other live courses: same first topic, same first role,
    same publisher. Most-enrolled first; empty tabs are left out.
    """
    from discovery.cards import course_card

    others = published_courses().exclude(pk=course.pk).order_by("-enrolled_count", "-updated_at")
    tabs = []
    topic = course.topics.first()
    if topic:
        tabs.append({"key": "topic", "label": f"More in {topic.name}", "slug": topic.slug,
                     "courses": others.filter(topics=topic).distinct()})
    role = course.roles.first()
    if role:
        tabs.append({"key": "role", "label": f"More for {role.name}", "slug": role.slug,
                     "courses": others.filter(roles=role).distinct()})
    if course.company_id:
        tabs.append({"key": "publisher", "label": f"More from {course.company.name}", "slug": course.company.slug,
                     "courses": others.filter(company=course.company)})
    else:
        owner = course.owner
        tabs.append({"key": "publisher", "label": f"More from {owner.display_name or owner.username}", "slug": owner.username,
                     "courses": others.filter(owner=owner, company__isnull=True)})
    filled = ({**tab, "courses": [course_card(c) for c in tab["courses"][:RELATED_PER_TAB]]} for tab in tabs)
    return [tab for tab in filled if tab["courses"]]

