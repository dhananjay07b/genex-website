"""
Demo learners, enrolments, progress and reviews for the live courses, so the
course pages show realistic numbers in development. Everything it creates
belongs to users whose username starts with `demo_`; `--clear` deletes them,
and with them all their enrolments, progress and reviews.

    python manage.py seed_course_demo          # add (safe to run again)
    python manage.py seed_course_demo --clear  # remove

Refuses to run unless DEBUG is on, so it never touches production data.
"""
import random

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from accounts.models import User
from learning.models import CourseReview, Enrollment, ItemProgress, Playlist

PREFIX = "demo_"

LEARNERS = [
    ("Aarav Sharma", "Graduate Engineer Trainee"), ("Priya Nair", "Solar O&M Engineer"),
    ("Rohan Gupta", "SCADA Engineer"), ("Sneha Kulkarni", "Electrical Engineer"),
    ("Vikram Iyer", "Protection Engineer"), ("Ananya Reddy", "Energy Analyst"),
    ("Karan Mehta", "Site Engineer"), ("Divya Menon", "Plant Manager"),
    ("Arjun Patel", "Automation Engineer"), ("Meera Joshi", "Project Engineer"),
    ("Siddharth Rao", "Commissioning Engineer"), ("Neha Verma", "Electrical Design Engineer"),
    ("Rahul Das", "O&M Supervisor"), ("Ishita Banerjee", "Energy Auditor"),
    ("Aditya Singh", "Field Service Engineer"), ("Pooja Pillai", "Grid Integration Engineer"),
]

# (stars, review) — specific, field-flavoured, varied in length; some ratings have no text.
REVIEWS = {
    5: [
        "Clear, practical and in a sensible order. I used the checklist from the second module on site the following week.",
        "Exactly the level I needed. The examples come from real plants, not textbook diagrams.",
        "Good balance of short videos and reading. I finished it over three evenings.",
        "The instructor explains why things are done, not just how. That made the later lessons easy to follow.",
        "",
    ],
    4: [
        "Solid course. A couple of lessons could go deeper, but the fundamentals are covered well.",
        "Useful and well organised. I would have liked one more worked example at the end.",
        "Good refresher for working engineers. Some parts were familiar, but the field tips were worth it.",
        "",
    ],
    3: [
        "Decent overview, but it moves quickly in the middle. Beginners may need to rewatch a few lessons.",
        "Helpful in places. I expected more on troubleshooting.",
    ],
    2: ["Too basic for my role. Fine as an introduction."],
    1: ["Not what I expected from the title."],
}
STAR_WEIGHTS = [(5, 55), (4, 30), (3, 10), (2, 3), (1, 2)]


class Command(BaseCommand):
    help = "Adds (or with --clear removes) demo learners, enrolments, progress and reviews for live courses. Development only."

    def add_arguments(self, parser):
        parser.add_argument("--clear", action="store_true", help="Delete every demo_ user and everything they created.")

    def handle(self, *args, clear=False, **options):
        if not settings.DEBUG:
            raise CommandError("seed_course_demo only runs with DEBUG on. It never touches production data.")
        if clear:
            deleted, _ = User.objects.filter(username__startswith=PREFIX).delete()
            self.stdout.write(self.style.SUCCESS(f"Removed demo users and their enrolments, progress and reviews ({deleted} rows)."))
            return
        with transaction.atomic():
            self._seed()

    def _seed(self):
        rng = random.Random(42)  # same demo data on every run
        learners = []
        for i, (name, role) in enumerate(LEARNERS, start=1):
            user, created = User.objects.get_or_create(
                username=f"{PREFIX}learner_{i:02d}",
                defaults={"email": f"{PREFIX}learner_{i:02d}@example.invalid", "display_name": name, "role_title": role},
            )
            if created:
                user.set_unusable_password()
                user.save(update_fields=["password"])
            learners.append(user)

        courses = list(Playlist.objects.filter(status=Playlist.STATUS_PUBLISHED).prefetch_related("items"))
        enrolments = reviews = 0
        for course in courses:
            lessons = list(course.items.all())
            if not lessons:
                continue
            for learner in rng.sample(learners, k=rng.randint(len(learners) // 2, len(learners))):
                _, new = Enrollment.objects.get_or_create(user=learner, playlist=course)
                enrolments += new
                done = rng.randint(0, len(lessons))
                for lesson in lessons[:done]:
                    ItemProgress.objects.get_or_create(user=learner, item=lesson)
                # Most learners who've started leave a rating (the enrolled-and-one-lesson rule).
                if done and rng.random() < 0.75:
                    stars = rng.choices([s for s, _ in STAR_WEIGHTS], weights=[w for _, w in STAR_WEIGHTS])[0]
                    _, new = CourseReview.objects.get_or_create(
                        user=learner, playlist=course,
                        defaults={"rating": stars, "body": rng.choice(REVIEWS[stars])},
                    )
                    reviews += new
        self.stdout.write(self.style.SUCCESS(
            f"{len(learners)} demo learners; {enrolments} new enrolments and {reviews} new reviews across {len(courses)} live courses. "
            "Remove them with: python manage.py seed_course_demo --clear"
        ))
