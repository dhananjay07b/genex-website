"""
Starting content for the GeLearn home page sections, taken from the approved
mockup (version 13). Editors change everything from here in the CMS. Only
fills a section list that is still empty, so it never overwrites edits.
"""
import json
import uuid

from django.db import migrations


def _block(type_, value):
    return {"type": type_, "value": value, "id": str(uuid.uuid4())}


def _items(values):
    """ListBlock children in Wagtail's list format."""
    return [{"type": "item", "value": v, "id": str(uuid.uuid4())} for v in values]


FAQ = [
    ("What is GeLearn?",
     "GeLearn is the learning platform of Genex Technocrats for the power, energy and automation sector. It brings "
     "together courses, GeAcademy articles, research, whitepapers, policy and tender summaries, videos and podcasts."),
    ("Who creates the courses and content?",
     "Courses come from verified Professionals, who are working engineers, and from verified companies through Company "
     "Studio. Blog posts and videos come from Professionals. Research, whitepapers and GeAcademy articles come from "
     "Genex and from verified partner companies."),
    ("Are the courses free?",
     "Many are. Each item is marked Free (open to everyone), Members (needs a free account) or with a price. Paid "
     "checkout is coming soon."),
    ("What is the difference between Learner, Professional and Company accounts?",
     "Learners take courses and save content. Professionals can also publish posts, videos and courses. Company "
     "accounts publish through Company Studio under their verified company name."),
    ("Can I change my account type later?",
     "Account types are set when you sign up and can only be changed by Genex. Contact us if you need to switch."),
    ("What does the verified company badge mean?",
     "It means the author signed up with an email address on that company's registered domain and confirmed it."),
    ("Do I get a certificate when I finish a course?",
     "Not yet. Certificates of completion are planned for a later release."),
    ("How can my company publish on GeLearn?",
     "Contact Genex. We create your company profile, register your email domains and set up Company Studio logins "
     "for your team."),
]

PROMO_PROFESSIONALS = {
    "tag": "For Professionals", "heading": "Share what you know from the field",
    "body": "Verified Professionals publish blog posts, videos and full courses, and choose whether each is free, "
            "members-only or paid.",
    "link_label": "How to become a Professional", "link_url": "/for-professionals", "tone": "mint",
}
PROMO_COMPANIES = {
    "tag": "GeLearn for Companies", "heading": "Build your company's authority in the sector",
    "body": "Publish courses, research and whitepapers from Company Studio, and have your engineers' work shown with "
            "a verified company badge.",
    "link_label": "Talk to Genex", "link_url": "/for-companies", "tone": "slate",
}


def visitor_sections():
    return [
        _block("hero", {"slides": _items([
            {"kicker": "Power & energy learning", "heading": "Learn the power sector from the engineers who run it",
             "body": "Courses, field notes and research from verified engineers at Genex and partner companies, "
                     "covering solar, storage, SCADA and the grid.",
             "cta_label": "Explore courses", "cta_url": "/courses", "tone": "slate", "image": None},
            {"kicker": "New course", "heading": "IEC 61850 substation automation in practice",
             "body": "Lessons from protection engineers, covering GOOSE messaging, SCL files and interoperability testing.",
             "cta_label": "View the course", "cta_url": "/courses", "tone": "sky", "image": None},
            {"kicker": "Policies & Tenders", "heading": "Regulation and tenders, summarised every week",
             "body": "Plain-language summaries of CERC, CEA and MNRE updates, plus open tenders with their closing dates.",
             "cta_label": "See what's open", "cta_url": "/policies-tenders", "tone": "mint", "image": None},
            {"kicker": "For companies", "heading": "Publish your engineering knowledge on GeLearn",
             "body": "Company Studio lets your team publish courses, GeAcademy articles, research, whitepapers and "
                     "podcasts under your verified company name.",
             "cta_label": "Talk to Genex", "cta_url": "/for-companies", "tone": "slate", "image": None},
        ])}),
        _block("new_and_popular", {"heading": "New and popular",
                                   "boxes": _items(["professionals", "popular_courses", "new_geacademy", "trending"])}),
        _block("role_band", {
            "heading": "Skills for the role you're working toward",
            "body": "Pick a role to see courses built by engineers who do that job, from plant commissioning to relay testing.",
            "cta_label": "Explore all courses", "cta_url": "/courses"}),
        _block("promo_pair", {"promos": _items([PROMO_PROFESSIONALS, PROMO_COMPANIES])}),
        _block("company_strip", {
            "heading": "Learn from verified companies in the sector",
            "subheading": "Every company badge is verified against the author's company email domain.",
            "see_all_label": "All companies", "see_all_url": "/companies"}),
        _block("goal_tiles", {"tiles": _items([
            {"title": "Start a career in power & energy", "subtitle": "Beginner courses, no experience needed",
             "link_url": "/search?type=course&level=beginner"},
            {"title": "Upskill in your current role", "subtitle": "Advanced courses for working engineers",
             "link_url": "/search?type=course&level=advanced"},
            {"title": "Publish as a company", "subtitle": "Company Studio and verified badges", "link_url": "/for-companies"},
        ])}),
        _block("topic_chips", {"heading": "Explore topics"}),
        _block("library_tabs", {
            "heading": "More than courses",
            "body": "Technical articles, field research, whitepapers, and conversations with the people running plants and grids.",
            "cta_label": "Browse the library", "cta_url": "/search"}),
        _block("live_sessions", {
            "heading": "Upcoming live sessions",
            "subheading": "Free webinars with engineers from Genex and partner companies. Registration opens on the host's page.",
            "see_all_label": "All sessions", "see_all_url": "/live-sessions"}),
        _block("trending_searches", {"heading": "Trending searches"}),
        _block("intent_strip", {"heading": "What brings you to GeLearn today?", "links": _items([
            {"label": "Start my career", "url": "/search?type=course&level=beginner"},
            {"label": "Move into renewables", "url": "/topics/solar"},
            {"label": "Grow in my role", "url": "/search?type=course&level=advanced"},
            {"label": "Track policy & tenders", "url": "/policies-tenders"},
            {"label": "Publish my work", "url": "/for-professionals"},
        ])}),
        _block("course_rail", {
            "heading": "Free courses from Genex and partner companies", "subheading": "",
            "source": "free", "topic": None, "role": None, "limit": 8, "style": "band",
            "body": "Start without paying. Free courses are open to everyone, and members-only content needs just a free account.",
            "see_all_label": "See free courses", "see_all_url": "/search?type=course&access=free"}),
        _block("careers", {
            "heading": "Explore careers in power & energy",
            "subheading": "What each role does, and the courses that prepare you for it.",
            "see_all_label": "All roles", "see_all_url": "/roles"}),
        _block("stats_banner", {
            "heading": "Built by engineers, for engineers",
            "body": "Content on GeLearn is written by people with site experience in commissioning, operating and "
                    "maintaining power assets, not by generalist writers.",
            "link_label": "Meet the contributors", "link_url": "/professionals"}),
        _block("testimonials", {"heading": "Why engineers choose GeLearn"}),
        _block("faq", {"heading": "Frequently asked questions",
                       "items": _items([{"question": q, "answer": a} for q, a in FAQ])}),
    ]


def member_sections():
    return [
        _block("welcome", {"goal_prompt": "Tell us the role you're working toward and we'll suggest courses for it."}),
        _block("resume", {"heading": "Pick up where you left off"}),
        _block("because", {"heading_prefix": "Because you're taking"}),
        _block("goal_courses", {"heading_prefix": "Courses for your goal:"}),
        _block("course_rail", {
            "heading": "Most popular courses", "subheading": "", "source": "popular", "topic": None, "role": None,
            "limit": 4, "style": "plain", "body": "", "see_all_label": "Show more", "see_all_url": "/courses"}),
        _block("closing_tenders", {
            "heading": "Policies & Tenders this week", "subheading": "Closing dates and summaries, updated by the editorial team.",
            "see_all_label": "All listings", "see_all_url": "/policies-tenders"}),
        _block("live_sessions", {"heading": "Upcoming live sessions", "subheading": "",
                                 "see_all_label": "All sessions", "see_all_url": "/live-sessions"}),
        _block("content_rail", {
            "heading": "New on GeAcademy", "subheading": "", "content_type": "geacademy", "topic": None,
            "max_minutes": None, "limit": 4, "see_all_label": "Show more", "see_all_url": "/geacademy"}),
        _block("promo_pair", {"promos": _items([
            {"tag": "Members", "heading": "Members-only content is open to you",
             "body": "Your free account unlocks every item marked Members across courses, videos and posts.",
             "link_label": "Browse members content", "link_url": "/search?access=members", "tone": "mint"},
            {"tag": "Want to publish?", "heading": "Ask Genex to make you a Professional",
             "body": "Professionals can publish posts, videos and courses. Account types are set by Genex, so contact "
                     "us to switch.",
             "link_label": "Contact Genex", "link_url": "/for-professionals", "tone": "slate"},
        ])}),
        _block("quick_videos", {"heading": "Learn something in under 20 minutes",
                                "see_all_label": "All videos", "see_all_url": "/search?type=video&max_minutes=20"}),
        _block("content_rail", {
            "heading": "Research", "subheading": "", "content_type": "research", "topic": None,
            "max_minutes": None, "limit": 4, "see_all_label": "Show more", "see_all_url": "/research"}),
        _block("course_rail", {
            "heading": "Start these free courses", "subheading": "", "source": "free", "topic": None, "role": None,
            "limit": 4, "style": "plain", "body": "", "see_all_label": "Show more",
            "see_all_url": "/search?type=course&access=free"}),
        _block("content_rail", {
            "heading": "Podcasts & interviews", "subheading": "", "content_type": "podcast", "topic": None,
            "max_minutes": None, "limit": 4, "see_all_label": "All episodes", "see_all_url": "/podcasts"}),
        _block("company_strip", {"heading": "Companies publishing on GeLearn", "subheading": "",
                                 "see_all_label": "All companies", "see_all_url": "/companies"}),
        _block("topic_chips", {"heading": "Explore topics"}),
    ]


FIELDS = {"home_sections": visitor_sections, "member_sections": member_sections}


def forwards(apps, schema_editor):
    GeLearnIndexPage = apps.get_model("pages", "GeLearnIndexPage")
    Revision = apps.get_model("wagtailcore", "Revision")
    for page in GeLearnIndexPage.objects.all():
        seeded = {}
        for field, build in FIELDS.items():
            if not getattr(page, field).raw_data:
                seeded[field] = build()
                setattr(page, field, seeded[field])
        if not seeded:
            continue
        page.save(update_fields=list(seeded))
        # Keep the latest revision in sync so the CMS editor (which loads it) shows the seeded sections.
        if page.latest_revision_id:
            rev = Revision.objects.get(pk=page.latest_revision_id)
            content = dict(rev.content)
            for field, stream in seeded.items():
                if not content.get(field) or content.get(field) == "[]":
                    content[field] = json.dumps(stream)
            rev.content = content
            rev.save(update_fields=["content"])


def backwards(apps, schema_editor):
    """Removal of the fields themselves (0040) clears the content; nothing extra to undo here."""


class Migration(migrations.Migration):

    dependencies = [
        ("pages", "0040_gelearn_home_sections"),
        ("learning", "0003_seed_career_roles"),
        ("wagtailcore", "0094_alter_page_locale"),
    ]

    operations = [migrations.RunPython(forwards, backwards)]
