"""
Sections of the GeLearn home page, as Wagtail blocks.

Editors arrange two section lists on the GeLearn index page: one for visitors
and one for signed-in learners. Each section holds only its own words and
settings (headings, links, uploaded images, which courses to show). Links
are picked, never typed (pages/links.py). The courses, content and people
inside each section are filled in live by
/api/discovery/home/, which returns the arranged sections as `layout`.
"""
from wagtail import blocks
from wagtail.images.blocks import ImageChooserBlock
from wagtail.snippets.blocks import SnippetChooserBlock

from .blocks import ImageApiStructBlock
from .links import LinkBlock




# ── Building blocks ──────────────────────────────────────────────────────────

class HeroSlide(ImageApiStructBlock):
    kicker = blocks.CharBlock(required=False, max_length=60, help_text="Small label above the heading.")
    heading = blocks.CharBlock(max_length=120)
    body = blocks.TextBlock(required=False, max_length=300)
    cta_label = blocks.CharBlock(required=False, max_length=40)
    cta_url = LinkBlock(optional=True, label="Button link")
    tone = blocks.ChoiceBlock(
        choices=[("slate", "Blue-grey"), ("sky", "Pale blue"), ("mint", "Mint")], default="slate",
        help_text="Background colour of the slide.",
    )
    image = ImageChooserBlock(required=False, help_text="Shown beside the text. Landscape, at least 1200px wide.")

    class Meta:
        icon = "image"
        label = "Slide"


class PromoCard(blocks.StructBlock):
    tag = blocks.CharBlock(required=False, max_length=40, help_text="Small label, e.g. 'For Professionals'.")
    heading = blocks.CharBlock(max_length=100)
    body = blocks.TextBlock(required=False, max_length=240)
    link_label = blocks.CharBlock(required=False, max_length=50)
    link_url = LinkBlock(optional=True, label="Link")
    tone = blocks.ChoiceBlock(choices=[("mint", "Mint"), ("slate", "Blue-grey")], default="mint")

    class Meta:
        icon = "pick"
        label = "Promo"


class GoalTile(blocks.StructBlock):
    title = blocks.CharBlock(max_length=60)
    subtitle = blocks.CharBlock(required=False, max_length=80)
    link_url = LinkBlock(label="Link")

    class Meta:
        icon = "link"


class LinkItem(blocks.StructBlock):
    label = blocks.CharBlock(max_length=40)
    url = LinkBlock(label="Link")

    class Meta:
        icon = "link"


class FaqItem(blocks.StructBlock):
    question = blocks.CharBlock(max_length=200)
    answer = blocks.TextBlock()

    class Meta:
        icon = "help"


def _see_all_label_block():
    return blocks.CharBlock(required=False, max_length=40, default="Show more")


def _see_all_url_block():
    return LinkBlock(optional=True, label="Show-more link")


# ── Sections ─────────────────────────────────────────────────────────────────

class HeroSection(blocks.StructBlock):
    slides = blocks.ListBlock(HeroSlide(), min_num=1, max_num=6)

    class Meta:
        icon = "image"
        label = "Hero slideshow"


class NewAndPopularSection(blocks.StructBlock):
    heading = blocks.CharBlock(default="New and popular")
    boxes = blocks.ListBlock(
        blocks.ChoiceBlock(choices=[
            ("professionals", "Our Leading Professionals"),
            ("popular_courses", "Most popular courses"),
            ("new_geacademy", "New on GeAcademy"),
            ("trending", "Trending this week"),
        ]),
        default=["professionals", "popular_courses", "new_geacademy", "trending"],
        help_text="The boxes in the slider, in order.",
    )

    class Meta:
        icon = "list-ul"
        label = "New and popular (slider)"


class CourseRailSection(blocks.StructBlock):
    heading = blocks.CharBlock()
    subheading = blocks.CharBlock(required=False)
    source = blocks.ChoiceBlock(choices=[
        ("popular", "Most enrolled"),
        ("free", "Free courses"),
        ("featured", "Featured by Genex"),
        ("newest", "Newest"),
        ("topic", "One topic (choose below)"),
        ("role", "One career role (choose below)"),
    ], default="popular")
    topic = SnippetChooserBlock("pages.Topic", required=False)
    role = SnippetChooserBlock("learning.CareerRole", required=False)
    limit = blocks.IntegerBlock(default=8, min_value=2, max_value=12)
    style = blocks.ChoiceBlock(
        choices=[("plain", "Plain row of cards"), ("band", "Coloured band with intro text")], default="plain",
    )
    body = blocks.TextBlock(required=False, help_text="Intro text, shown in band style only.")

    see_all_label = _see_all_label_block()
    see_all_url = _see_all_url_block()

    class Meta:
        icon = "list-ul"
        label = "Course row"


class ContentRailSection(blocks.StructBlock):
    heading = blocks.CharBlock()
    subheading = blocks.CharBlock(required=False)
    content_type = blocks.ChoiceBlock(choices=[
        ("geacademy", "GeAcademy articles"),
        ("research", "Research"),
        ("whitepaper", "Whitepapers"),
        ("video", "Videos"),
        ("podcast", "Podcasts"),
        ("blog", "Blog posts"),
    ])
    topic = SnippetChooserBlock("pages.Topic", required=False, help_text="Optional: only this topic.")
    max_minutes = blocks.IntegerBlock(required=False, min_value=1, help_text="Videos and podcasts only: at most this long.")
    limit = blocks.IntegerBlock(default=4, min_value=2, max_value=12)

    see_all_label = _see_all_label_block()
    see_all_url = _see_all_url_block()

    class Meta:
        icon = "doc-full"
        label = "Content row"


class RoleBandSection(blocks.StructBlock):
    heading = blocks.CharBlock(default="Skills for the role you're working toward")
    body = blocks.TextBlock(required=False)
    cta_label = blocks.CharBlock(required=False, max_length=40)
    cta_url = LinkBlock(optional=True, label="Button link")

    class Meta:
        icon = "user"
        label = "Courses by career role (tabs)"


class PromoPairSection(blocks.StructBlock):
    promos = blocks.ListBlock(PromoCard(), min_num=1, max_num=2)

    class Meta:
        icon = "pick"
        label = "Promo cards"


class CompanyStripSection(blocks.StructBlock):
    heading = blocks.CharBlock(default="Learn from verified companies in the sector")
    subheading = blocks.CharBlock(required=False)

    see_all_label = _see_all_label_block()
    see_all_url = _see_all_url_block()

    class Meta:
        icon = "group"
        label = "Company logos"


class GoalTilesSection(blocks.StructBlock):
    tiles = blocks.ListBlock(GoalTile(), min_num=1, max_num=3)

    class Meta:
        icon = "link"
        label = "Goal tiles"


class TopicChipsSection(blocks.StructBlock):
    heading = blocks.CharBlock(default="Explore topics")

    class Meta:
        icon = "tag"
        label = "Topic chips"


class LibraryTabsSection(blocks.StructBlock):
    heading = blocks.CharBlock(default="More than courses")
    body = blocks.TextBlock(required=False)
    cta_label = blocks.CharBlock(required=False, max_length=40)
    cta_url = LinkBlock(optional=True, label="Button link")

    class Meta:
        icon = "folder-open-inverse"
        label = "Library (tabs)"


class TrendingSearchesSection(blocks.StructBlock):
    heading = blocks.CharBlock(default="Trending searches")

    class Meta:
        icon = "search"
        label = "Trending searches"


class IntentStripSection(blocks.StructBlock):
    heading = blocks.CharBlock(default="What brings you to GeLearn today?")
    links = blocks.ListBlock(LinkItem(), min_num=1, max_num=6)

    class Meta:
        icon = "link"
        label = "'What brings you here' links"


class LiveSessionsSection(blocks.StructBlock):
    heading = blocks.CharBlock(default="Upcoming live sessions")
    subheading = blocks.CharBlock(required=False)

    see_all_label = _see_all_label_block()
    see_all_url = _see_all_url_block()

    class Meta:
        icon = "date"
        label = "Upcoming live sessions"


class CareersSection(blocks.StructBlock):
    heading = blocks.CharBlock(default="Explore careers in power & energy")
    subheading = blocks.CharBlock(required=False)

    see_all_label = _see_all_label_block()
    see_all_url = _see_all_url_block()

    class Meta:
        icon = "user"
        label = "Career role cards"


class StatsBannerSection(blocks.StructBlock):
    heading = blocks.CharBlock()
    body = blocks.TextBlock(required=False)
    link_label = blocks.CharBlock(required=False, max_length=40)
    link_url = LinkBlock(optional=True, label="Link")

    class Meta:
        icon = "pick"
        label = "Stats banner (courses, experts, companies)"


class TestimonialsSection(blocks.StructBlock):
    heading = blocks.CharBlock(default="Why engineers choose GeLearn")

    class Meta:
        icon = "openquote"
        label = "Testimonials (shown once 3 are active)"


class FaqSection(blocks.StructBlock):
    heading = blocks.CharBlock(default="Frequently asked questions")
    items = blocks.ListBlock(FaqItem(), min_num=1)

    class Meta:
        icon = "help"
        label = "FAQ"


# Signed-in only ──────────────────────────────────────────────────────────────

class WelcomeSection(blocks.StructBlock):
    goal_prompt = blocks.CharBlock(
        required=False, default="Tell us the role you're working toward and we'll suggest courses for it.",
        help_text="Shown to learners who haven't set a career goal yet.",
    )

    class Meta:
        icon = "user"
        label = "Welcome: continue learning and this week"


class ResumeSection(blocks.StructBlock):
    heading = blocks.CharBlock(default="Pick up where you left off")

    class Meta:
        icon = "history"
        label = "Recently viewed and similar"


class BecauseSection(blocks.StructBlock):
    heading_prefix = blocks.CharBlock(default="Because you're taking", help_text="Followed by the course title.")

    class Meta:
        icon = "list-ul"
        label = "Because you're taking…"


class GoalCoursesSection(blocks.StructBlock):
    heading_prefix = blocks.CharBlock(default="Courses for your goal:", help_text="Followed by the role name.")

    class Meta:
        icon = "user"
        label = "Courses for the learner's career goal"


class ClosingTendersSection(blocks.StructBlock):
    heading = blocks.CharBlock(default="Policies & Tenders this week")
    subheading = blocks.CharBlock(required=False)

    see_all_label = _see_all_label_block()
    see_all_url = _see_all_url_block()

    class Meta:
        icon = "doc-full"
        label = "Tenders closing soon"


class QuickVideosSection(blocks.StructBlock):
    heading = blocks.CharBlock(default="Learn something in under 20 minutes")

    see_all_label = _see_all_label_block()
    see_all_url = _see_all_url_block()

    class Meta:
        icon = "media"
        label = "Videos under 20 minutes"


SHARED_SECTIONS = [
    ("hero", HeroSection()),
    ("new_and_popular", NewAndPopularSection()),
    ("course_rail", CourseRailSection()),
    ("content_rail", ContentRailSection()),
    ("role_band", RoleBandSection()),
    ("promo_pair", PromoPairSection()),
    ("company_strip", CompanyStripSection()),
    ("goal_tiles", GoalTilesSection()),
    ("topic_chips", TopicChipsSection()),
    ("library_tabs", LibraryTabsSection()),
    ("trending_searches", TrendingSearchesSection()),
    ("intent_strip", IntentStripSection()),
    ("live_sessions", LiveSessionsSection()),
    ("careers", CareersSection()),
    ("stats_banner", StatsBannerSection()),
    ("testimonials", TestimonialsSection()),
    ("faq", FaqSection()),
]

MEMBER_ONLY_SECTIONS = [
    ("welcome", WelcomeSection()),
    ("resume", ResumeSection()),
    ("because", BecauseSection()),
    ("goal_courses", GoalCoursesSection()),
    ("closing_tenders", ClosingTendersSection()),
    ("quick_videos", QuickVideosSection()),
]

HOME_SECTIONS = SHARED_SECTIONS
MEMBER_SECTIONS = MEMBER_ONLY_SECTIONS + SHARED_SECTIONS
