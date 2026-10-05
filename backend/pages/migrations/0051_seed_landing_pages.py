"""
Starting content for the For Professionals and For Companies pages, from the
approved mockup. Links are picker choices (pages/links.py), never typed.
Only fills a page that is still empty; editable in the CMS.
"""
import json
import uuid

from django.db import migrations


def _block(type_, value):
    return {"type": type_, "value": value, "id": str(uuid.uuid4())}


def _items(values):
    return [{"type": "item", "value": v, "id": str(uuid.uuid4())} for v in values]


def _page(key):
    return {"link_type": "page", "page": key}


def _contact(apps):
    page = apps.get_model("wagtailcore", "Page").objects.filter(url_path="/contact/").first()
    return {"link_type": "genex_page", "genex_page": page.pk, "section": "form"} if page else {"link_type": "none"}


def professionals_page(apps):
    return [
        _block("landing_hero", {
            "kicker": "For Professionals",
            "heading": "Share what you know from the field",
            "body": "GeLearn Professionals are working engineers. They publish posts, videos and full courses under their "
                    "verified company name, and choose whether each is free, members-only or paid.",
            "primary_label": "Sign up as a Professional", "primary_link": _page("register"),
            "secondary_label": "Already a Learner? Contact Genex", "secondary_link": _contact(apps),
            "stats_heading": "Professionals on GeLearn", "stats": ["verified_professionals", "courses", "learners"],
        }),
        _block("steps", {"heading": "How it works", "subheading": "From sign-up to your first published course.", "steps": _items([
            {"title": "Sign up with your work email", "text": "Choose \"Professional\" and your company. The account type is fixed after sign-up."},
            {"title": "Confirm your email", "text": "Your company badge turns verified when your email domain matches your company's."},
            {"title": "Publish posts and videos", "text": "Each submission is reviewed by Genex before it goes live."},
            {"title": "Build a course", "text": "Arrange your published videos and posts into an ordered course with a level and topics."},
            {"title": "Get featured", "text": "Genex features and rates leading Professionals on the GeLearn home page."},
        ])}),
        _block("list_panels", {"panels": _items([
            {"heading": "What you can publish", "items": _items([
                {"title": "Blog posts", "text": "Field notes, how-tos and lessons learned.", "planned": False},
                {"title": "Videos", "text": "Walkthroughs, demos and site footage.", "planned": False},
                {"title": "Courses", "text": "Your posts and videos in order, with a level, topics and career roles.", "planned": False},
                {"title": "Podcast appearances", "text": "Shown on your profile when a company features you.", "planned": False},
            ])},
            {"heading": "What you get", "items": _items([
                {"title": "A verified company badge", "text": "On everything you publish.", "planned": False},
                {"title": "Your choice of access", "text": "Free, members-only or paid. Payments are being planned.", "planned": True},
                {"title": "A GeLearn rating", "text": "And a chance to be featured on the home page.", "planned": False},
                {"title": "A public profile", "text": "Listing your expertise, courses and posts.", "planned": False},
            ])},
        ])}),
        _block("faq", {"heading": "Frequently asked questions", "items": _items([
            {"question": "I signed up as a Learner. Can I switch?",
             "answer": "Account types can only be changed by Genex. Contact us and we'll upgrade your account after checking your company email."},
            {"question": "My company isn't listed. Can I still publish?",
             "answer": "Yes. You can sign up with an unlisted company name; it's shown as plain text without the verified badge."},
            {"question": "Who reviews my content?",
             "answer": "The Genex team reviews every post, video and course before it's published."},
        ])}),
    ]


def companies_page(apps):
    return [
        _block("landing_hero", {
            "kicker": "GeLearn for Companies",
            "heading": "Build your company's authority in the power sector",
            "body": "Publish courses, research, whitepapers and podcasts from Company Studio. Everything carries your verified "
                    "company badge, and your engineers' work is linked to your company page.",
            "primary_label": "Talk to Genex", "primary_link": _contact(apps),
            "secondary_label": "See companies on GeLearn", "secondary_link": _page("companies"),
            "stats_heading": "Already on GeLearn", "stats": ["companies", "research_and_whitepapers", "courses"],
        }),
        _block("list_panels", {"panels": _items([
            {"heading": "Publish from Company Studio", "items": _items([
                {"title": "Courses", "text": "Built from your published articles, research, whitepapers and podcasts.", "planned": False},
                {"title": "GeAcademy articles", "text": "In-depth technical explainers.", "planned": False},
                {"title": "Research", "text": "Field deployments and verified outcomes.", "planned": False},
                {"title": "Whitepapers and policy & tender listings", "text": "Whitepapers as downloadable PDFs.", "planned": False},
                {"title": "Podcasts", "text": "Featuring your engineers and partners.", "planned": False},
            ])},
            {"heading": "What your company gets", "items": _items([
                {"title": "A verified company page", "text": "Listing your content, experts and courses.", "planned": False},
                {"title": "Your engineers verified automatically", "text": "When they sign up with a company email.", "planned": False},
                {"title": "Live sessions", "text": "Listed on GeLearn, with registration on your own page.", "planned": False},
                {"title": "Team training", "text": "Enrol your staff in courses and track progress.", "planned": True},
            ])},
        ])}),
        _block("steps", {"heading": "How onboarding works", "subheading": "Usually a few days from first call to first published item.", "steps": _items([
            {"title": "Talk to Genex", "text": "Tell us what you want to publish and who'll publish it."},
            {"title": "We set up your company", "text": "Name, logo, description and the email domains your staff use."},
            {"title": "Staff logins", "text": "Genex creates Company Studio logins for your team."},
            {"title": "Publish", "text": "Your team publishes from Company Studio; items go live straight away."},
            {"title": "Grow", "text": "Your engineers sign up as Professionals and are verified to your company."},
        ])}),
        _block("faq", {"heading": "Frequently asked questions", "items": _items([
            {"question": "What does it cost?", "answer": "Contact Genex to discuss your company's plans."},
            {"question": "Who can publish for our company?",
             "answer": "Company Studio logins created by Genex. Your engineers can also publish as Professionals under your verified name."},
            {"question": "Can we sell courses?",
             "answer": "Courses can be free, members-only or paid. Checkout is being planned and isn't live yet."},
        ])}),
    ]


FIELDS = {"for_professionals": professionals_page, "for_companies": companies_page}


def forwards(apps, schema_editor):
    GeLearnIndexPage = apps.get_model("pages", "GeLearnIndexPage")
    Revision = apps.get_model("wagtailcore", "Revision")
    for page in GeLearnIndexPage.objects.all():
        seeded = {}
        for field, build in FIELDS.items():
            if not getattr(page, field).raw_data:
                seeded[field] = build(apps)
                setattr(page, field, seeded[field])
        if not seeded:
            continue
        page.save(update_fields=list(seeded))
        if page.latest_revision_id:
            rev = Revision.objects.get(pk=page.latest_revision_id)
            content = dict(rev.content)
            for field, stream in seeded.items():
                if not content.get(field) or content.get(field) == "[]":
                    content[field] = json.dumps(stream)
            rev.content = content
            rev.save(update_fields=["content"])


class Migration(migrations.Migration):
    dependencies = [("pages", "0050_landing_pages"), ("wagtailcore", "0094_alter_page_locale")]
    operations = [migrations.RunPython(forwards, migrations.RunPython.noop)]
