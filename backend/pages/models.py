import json
from django.db import models
from django.utils.translation import gettext_lazy as _
from modelcluster.fields import ParentalKey
from taggit.managers import TaggableManager
from wagtail.admin.panels import FieldPanel, InlinePanel, MultiFieldPanel
from wagtail.api import APIField
from wagtail.fields import RichTextField, StreamField
from wagtail.images.models import Image
from wagtail.models import Orderable, Page
from wagtail.search import index
from wagtail.snippets.models import register_snippet
from wagtail.contrib.settings.models import BaseSiteSetting, register_setting
from wagtail import blocks

from .blocks import (
    AppDownloadBlock,
    AchievementBlock,
    CapabilitiesSectionBlock,
    CardGridSectionBlock,
    CertificationBlock,
    ContactDetailBlock,
    CTABandBlock,
    CredibilityLogoBlock,
    DeploymentStepsSectionBlock,
    DocumentSectionBlock,
    EngineeringPrincipleBlock,
    EventBannerBlock,
    FAQSectionBlock,
    GalleryItemBlock,
    GenexEdgeSectionBlock,
    GeLearnTeaserCardBlock,
    HeroSectionBlock,
    HeroSlideBlock,
    HowWeWorkPageBlock,
    IntroductionSectionBlock,
    InnovationsSectionBlock,
    InnovationsTeaserItemBlock,
    LeaderBlock,
    LeadershipCardBlock,
    MapEmbedBlock,
    MilestoneBlock,
    OpenRoleBlock,
    OverviewSectionBlock,
    PortfolioSectionBlock,
    PressItemBlock,
    ProductTestimonialSectionBlock,
    ProductVideoSectionBlock,
    ProjectShowcaseItemBlock,
    ProjectTypeChoiceBlock,
    RichTextBlock,
    SideImageSectionBlock,
    StatBlock,
    StatsGridSectionBlock,
    TeamSectionBlock,
    TechHighlightsSectionBlock,
    TechPartnerBlock,
    TestimonialItemBlock,
    VisionMissionCardBlock,
    WhatWeBuildTabBlock,
    WhyGenexCardBlock,
    WorldMapSectionBlock,
)


# ---------------------------------------------------------------------------
# Abstract base — shared SEO fields on every page
# ---------------------------------------------------------------------------
class BasePage(Page):
    """SEO fields deliberately reuse Wagtail's own built-in seo_title/search_description
    (shown by default on every page's Promote tab) instead of duplicating them with
    custom fields — a previous version defined meta_title/meta_description/meta_keywords
    here, which just shadowed the built-ins with a second set of fields the frontend
    actually read, leaving the built-ins visible in the admin but silently ignored."""
    hide_footer_cta = models.BooleanField(default=False)

    promote_panels = Page.promote_panels + [
        FieldPanel("hide_footer_cta"),
    ]

    api_fields = [
        APIField("seo_title"),
        APIField("search_description"),
        APIField("hide_footer_cta"),
    ]

    class Meta:
        abstract = True


# ---------------------------------------------------------------------------
# Site Settings — phone, WhatsApp, global CTA
# ---------------------------------------------------------------------------
@register_setting
class SiteSettings(BaseSiteSetting):
    phone      = models.CharField(max_length=30, blank=True)
    whatsapp   = models.URLField(blank=True)
    email      = models.EmailField(blank=True)
    cta_label  = models.CharField(max_length=50, default="Request Demo")
    cta_href   = models.CharField(max_length=100, default="/contact#demo")

    panels = [
        MultiFieldPanel([
            FieldPanel("phone"),
            FieldPanel("whatsapp"),
            FieldPanel("email"),
        ], heading="Contact"),
        MultiFieldPanel([
            FieldPanel("cta_label"),
            FieldPanel("cta_href"),
        ], heading="Global CTA"),
    ]

    class Meta:
        verbose_name = "Site Settings"


# ===========================================================================
# HOMEPAGE
# ===========================================================================
class HomePage(BasePage):
    event_banner      = StreamField([("event", EventBannerBlock())], blank=True, use_json_field=True)
    hero_slides       = StreamField([("slide", HeroSlideBlock())], use_json_field=True, min_num=1)
    credibility_strip = StreamField([("client", CredibilityLogoBlock())], use_json_field=True, min_num=1)
    impact_stats      = StreamField([("stat", StatBlock())], use_json_field=True, min_num=1)
    what_we_build     = StreamField([("tab", WhatWeBuildTabBlock())], use_json_field=True, min_num=1)
    edge_section      = StreamField([("section", GenexEdgeSectionBlock())], use_json_field=True, max_num=1)
    projects_showcase = StreamField([("item", ProjectShowcaseItemBlock())], use_json_field=True, min_num=1)
    innovations_teaser = StreamField([("item", InnovationsTeaserItemBlock())], use_json_field=True, min_num=1)
    world_map         = StreamField([("map", WorldMapSectionBlock())], blank=True, use_json_field=True, max_num=1)
    tech_partners     = StreamField([("partner", TechPartnerBlock())], use_json_field=True, min_num=1)
    testimonials      = StreamField([("item", TestimonialItemBlock())], use_json_field=True, min_num=1)
    gelearn_teaser    = StreamField([("card", GeLearnTeaserCardBlock())], use_json_field=True, min_num=1)
    cta_section       = StreamField([("cta", CTABandBlock())], use_json_field=True)
    app_download      = StreamField([("download", AppDownloadBlock())], blank=True, use_json_field=True)

    content_panels = Page.content_panels + [
        FieldPanel("event_banner"),
        FieldPanel("hero_slides"),
        FieldPanel("credibility_strip"),
        FieldPanel("impact_stats"),
        FieldPanel("what_we_build"),
        FieldPanel("edge_section"),
        FieldPanel("projects_showcase"),
        FieldPanel("innovations_teaser"),
        FieldPanel("world_map"),
        FieldPanel("tech_partners"),
        FieldPanel("testimonials"),
        FieldPanel("gelearn_teaser"),
        FieldPanel("cta_section"),
        FieldPanel("app_download"),
    ]

    api_fields = BasePage.api_fields + [
        APIField("event_banner"),
        APIField("hero_slides"),
        APIField("credibility_strip"),
        APIField("impact_stats"),
        APIField("what_we_build"),
        APIField("edge_section"),
        APIField("projects_showcase"),
        APIField("innovations_teaser"),
        APIField("world_map"),
        APIField("tech_partners"),
        APIField("testimonials"),
        APIField("gelearn_teaser"),
        APIField("cta_section"),
        APIField("app_download"),
    ]

    parent_page_types = ["wagtailcore.Page"]
    subpage_types = []

    class Meta:
        verbose_name = "Home Page"


# ===========================================================================
# GENERIC SECTION / CONTENT PAGES
# ===========================================================================
# Shared by Portfolio, Innovations, and About: one SectionPage per section
# landing (e.g. /portfolio, /innovations, /about), with ContentPage instances
# as its children (and grandchildren — ContentPage can nest under itself) for
# every inner page. Both share the exact same body block palette below, so
# any block can be added to any Section/Content page with zero backend code
# changes. GeLearn, Careers, and Contact are intentionally NOT part of this —
# they keep their own dedicated models with page-specific block choices.
CONTENT_BODY_BLOCKS = [
    ("hero", HeroSectionBlock()),
    ("intro", IntroductionSectionBlock()),
    ("card_section", CardGridSectionBlock()),
    ("portfolio_section", PortfolioSectionBlock()),
    ("innovations_section", InnovationsSectionBlock()),
    ("stats", StatsGridSectionBlock()),
    ("side_section", SideImageSectionBlock()),
    ("overview", OverviewSectionBlock()),
    ("capabilities", CapabilitiesSectionBlock()),
    ("tech_highlights", TechHighlightsSectionBlock()),
    ("deployment_steps", DeploymentStepsSectionBlock()),
    ("video_section", ProductVideoSectionBlock()),
    ("testimonials_section", ProductTestimonialSectionBlock()),
    ("documents", DocumentSectionBlock()),
    ("faq_section", FAQSectionBlock()),
    ("how_we_work", HowWeWorkPageBlock()),
    ("milestones", blocks.ListBlock(MilestoneBlock(), label="Milestones")),
    ("vision_cards", blocks.ListBlock(VisionMissionCardBlock(), label="Vision Cards")),
    ("mission_points", blocks.ListBlock(VisionMissionCardBlock(), label="Mission Points")),
    ("leadership", blocks.ListBlock(LeadershipCardBlock(), label="Leadership Cards")),
    ("certifications", blocks.ListBlock(CertificationBlock(), label="Certifications")),
    ("partner_names", blocks.ListBlock(blocks.CharBlock(), label="Partner Names")),
    ("achievements", blocks.ListBlock(AchievementBlock(), label="Achievements")),
    ("press_items", blocks.ListBlock(PressItemBlock(), label="Press Items")),
    ("gallery", blocks.ListBlock(GalleryItemBlock(), label="Gallery")),
    ("leader", LeaderBlock()),
    ("team_section", TeamSectionBlock()),
    ("cta", CTABandBlock()),
]


class SectionPage(BasePage):
    """A top-level section landing page — e.g. Portfolio, Innovations, About."""
    body = StreamField(CONTENT_BODY_BLOCKS, blank=True, use_json_field=True)

    content_panels = Page.content_panels + [FieldPanel("body")]
    api_fields = BasePage.api_fields + [APIField("body")]

    parent_page_types = ["wagtailcore.Page"]
    subpage_types = ["pages.ContentPage"]

    class Meta:
        verbose_name = "Section Page"


class ContentPage(BasePage):
    """
    A generic inner page under any SectionPage (Portfolio/Innovations/About).
    Can also nest under another ContentPage, to arbitrary depth.
    """
    tags = StreamField(
        [("tag", blocks.CharBlock())], blank=True, use_json_field=True,
        help_text="Freeform labels for listing/filter UI (e.g. product family, innovation stage). Leave blank if not applicable.",
    )
    icon_image = models.ForeignKey(
        "wagtailimages.Image", null=True, blank=True,
        on_delete=models.SET_NULL, related_name="+",
        help_text="Small icon used on listing cards, where applicable. Leave blank otherwise.",
    )

    body = StreamField(CONTENT_BODY_BLOCKS, blank=True, use_json_field=True)

    content_panels = Page.content_panels + [
        FieldPanel("tags"),
        FieldPanel("icon_image"),
        FieldPanel("body"),
    ]

    @property
    def icon_url(self):
        return self.icon_image.file.url if self.icon_image else None

    api_fields = BasePage.api_fields + [
        APIField("tags"),
        APIField("icon_url"),
        APIField("body"),
    ]

    parent_page_types = ["pages.SectionPage", "pages.ContentPage"]
    subpage_types = ["pages.ContentPage"]

    class Meta:
        verbose_name = "Content Page"


# ===========================================================================
# GELEARN
# ===========================================================================
class GeLearnIndexPage(BasePage):
    intro_headline = models.CharField(max_length=255, blank=True)
    body = StreamField([
        ("hero", HeroSectionBlock()),
        ("card_section", CardGridSectionBlock()),
        ("cta", CTABandBlock()),
    ], blank=True, use_json_field=True)

    content_panels = Page.content_panels + [
        FieldPanel("intro_headline"),
        FieldPanel("body"),
    ]

    api_fields = BasePage.api_fields + [
        APIField("intro_headline"),
        APIField("body"),
    ]

    parent_page_types = ["wagtailcore.Page"]
    subpage_types = ["pages.GeLearnSectionPage"]

    class Meta:
        verbose_name = "GeLearn Index Page"


GELEARN_SECTION_TYPE_CHOICES = [
    ("technology", "Technology Deep Dives"),
    ("case-studies", "Case Studies"),
    ("tenders", "Tenders"),
    ("whitepapers", "Whitepapers"),
    ("videos", "Videos"),
    ("blog", "Blog"),
    ("podcasts", "Podcasts"),
]


class GeLearnSectionPage(BasePage):
    section_type = models.CharField(
        max_length=30, choices=GELEARN_SECTION_TYPE_CHOICES, blank=True,
        help_text="Controls which snippet list the frontend queries",
    )
    # "How We Work" and "FAQ" live as ContentPage instances under the About
    # SectionPage instead — not offered here, to avoid the same content
    # existing in two places.
    body = StreamField([
        ("hero", HeroSectionBlock()),
        ("card_section", CardGridSectionBlock()),
        ("stats", StatsGridSectionBlock()),
        ("side_section", SideImageSectionBlock()),
        ("intro", IntroductionSectionBlock()),
        ("cta", CTABandBlock()),
    ], blank=True, use_json_field=True)

    content_panels = Page.content_panels + [
        FieldPanel("section_type"),
        FieldPanel("body"),
    ]

    api_fields = BasePage.api_fields + [
        APIField("section_type"),
        APIField("body"),
    ]

    parent_page_types = ["pages.GeLearnIndexPage"]
    subpage_types = []

    class Meta:
        verbose_name = "GeLearn Section Page"


# ===========================================================================
# CAREERS
# ===========================================================================
class CareersPage(BasePage):
    body = StreamField([
        ("hero", HeroSectionBlock()),
        ("why_genex", blocks.ListBlock(WhyGenexCardBlock(), label="Why Genex Cards")),
        ("open_roles", blocks.ListBlock(OpenRoleBlock(), label="Open Roles")),
        ("perks", blocks.ListBlock(blocks.CharBlock(), label="Perks")),
        ("cta", CTABandBlock()),
    ], blank=True, use_json_field=True)

    content_panels = Page.content_panels + [FieldPanel("body")]
    api_fields = BasePage.api_fields + [APIField("body")]

    parent_page_types = ["wagtailcore.Page"]
    subpage_types = ["pages.JobPage"]

    class Meta:
        verbose_name = "Careers Page"


class JobPage(BasePage):
    department  = models.CharField(max_length=100, blank=True)
    location    = models.CharField(max_length=100, blank=True)
    job_type    = models.CharField(max_length=50, blank=True, help_text="e.g. Full-time")
    description = models.TextField(blank=True)
    is_open     = models.BooleanField(default=True)

    body = StreamField([
        ("intro", IntroductionSectionBlock()),
        ("cta", CTABandBlock()),
    ], blank=True, use_json_field=True)

    content_panels = Page.content_panels + [
        MultiFieldPanel([
            FieldPanel("department"),
            FieldPanel("location"),
            FieldPanel("job_type"),
            FieldPanel("is_open"),
            FieldPanel("description"),
        ], heading="Job Details"),
        FieldPanel("body"),
    ]

    api_fields = BasePage.api_fields + [
        APIField("department"),
        APIField("location"),
        APIField("job_type"),
        APIField("is_open"),
        APIField("description"),
        APIField("body"),
    ]

    parent_page_types = ["pages.CareersPage"]
    subpage_types = []

    class Meta:
        verbose_name = "Job Page"


# ===========================================================================
# CONTACT
# ===========================================================================
class ContactPage(BasePage):
    body = StreamField([
        ("hero", HeroSectionBlock()),
        ("contact_details", blocks.ListBlock(ContactDetailBlock(), label="Contact Details")),
        ("project_types", blocks.ListBlock(ProjectTypeChoiceBlock(), label="Project Types")),
        ("map", MapEmbedBlock()),
        ("cta", CTABandBlock()),
    ], blank=True, use_json_field=True)

    content_panels = Page.content_panels + [FieldPanel("body")]
    api_fields = BasePage.api_fields + [APIField("body")]

    parent_page_types = ["wagtailcore.Page"]
    subpage_types = []

    class Meta:
        verbose_name = "Contact Page"


# ===========================================================================
# SNIPPETS — independent content items (GeLearn listing data)
# ===========================================================================

@register_snippet
class TeamCategory(models.Model):
    """A named team grouping (e.g. 'Development Team') with a display order.
    Assigned to TeamMemberBlock items; the frontend groups/sorts members by this."""
    name     = models.CharField(max_length=100)
    priority = models.IntegerField(default=0, help_text="Lower numbers show first")

    panels = [
        FieldPanel("name"),
        FieldPanel("priority"),
    ]

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Team Category"
        verbose_name_plural = "Team Categories"
        ordering = ["priority", "name"]


@register_snippet
class CaseStudy(models.Model):
    title          = models.CharField(max_length=255)
    category       = models.CharField(max_length=50)
    category_color = models.CharField(max_length=50, help_text="Tailwind bg class e.g. 'bg-primary'")
    excerpt        = models.TextField()
    date           = models.DateField()
    read_time      = models.CharField(max_length=30, default="4 Mins Read")
    image          = models.ForeignKey(
        "wagtailimages.Image", null=True, blank=True,
        on_delete=models.SET_NULL, related_name="+",
    )
    intro          = RichTextField(blank=True)
    sections       = StreamField([
        ("section", blocks.StructBlock([
            ("heading", blocks.CharBlock()),
            ("body", RichTextBlock()),
        ]))
    ], blank=True, use_json_field=True)
    updated_by     = models.ForeignKey(
        "accounts.User", null=True, blank=True,
        on_delete=models.SET_NULL, related_name="+",
    )

    panels = [
        FieldPanel("title"),
        MultiFieldPanel([
            FieldPanel("category"),
            FieldPanel("category_color"),
            FieldPanel("date"),
            FieldPanel("read_time"),
        ], heading="Metadata"),
        FieldPanel("image"),
        FieldPanel("excerpt"),
        FieldPanel("intro"),
        FieldPanel("sections"),
    ]

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = "Case Study"
        verbose_name_plural = "Case Studies"
        ordering = ["-date"]


@register_snippet
class TechArticle(models.Model):
    DIFFICULTY_CHOICES = [
        ("Beginner", "Beginner"),
        ("Intermediate", "Intermediate"),
        ("Advanced", "Advanced"),
    ]

    title           = models.CharField(max_length=255)
    topic           = models.CharField(max_length=100)
    difficulty      = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default="Intermediate")
    read_time       = models.CharField(max_length=30)
    date            = models.DateField()
    excerpt         = models.TextField()
    tags            = TaggableManager(blank=True)
    featured        = models.BooleanField(default=False)
    image           = models.ForeignKey(
        "wagtailimages.Image", null=True, blank=True,
        on_delete=models.SET_NULL, related_name="+",
    )
    intro           = RichTextField(blank=True)
    sections        = StreamField([
        ("section", blocks.StructBlock([
            ("heading", blocks.CharBlock()),
            ("body", RichTextBlock()),
        ]))
    ], blank=True, use_json_field=True)
    callout_label   = models.CharField(max_length=100, blank=True)
    callout_content = models.TextField(blank=True)
    takeaways       = StreamField([("point", blocks.CharBlock())], blank=True, use_json_field=True)

    panels = [
        FieldPanel("title"),
        MultiFieldPanel([
            FieldPanel("topic"),
            FieldPanel("difficulty"),
            FieldPanel("read_time"),
            FieldPanel("date"),
            FieldPanel("featured"),
            FieldPanel("tags"),
        ], heading="Metadata"),
        FieldPanel("image"),
        FieldPanel("excerpt"),
        FieldPanel("intro"),
        FieldPanel("sections"),
        MultiFieldPanel([
            FieldPanel("callout_label"),
            FieldPanel("callout_content"),
        ], heading="Callout Box"),
        FieldPanel("takeaways"),
    ]

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = "Tech Article"
        ordering = ["-featured", "-date"]


@register_snippet
class Tender(models.Model):
    STATUS_CHOICES = [
        ("Open", "Open"),
        ("Upcoming", "Upcoming"),
        ("Closed", "Closed"),
    ]

    title       = models.CharField(max_length=255)
    authority   = models.CharField(max_length=200)
    deadline    = models.CharField(max_length=30, help_text="e.g. '30 / 06 / 2026'")
    value       = models.CharField(max_length=100, help_text="e.g. '₹1.2 Cr – ₹2.5 Cr'")
    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Open")
    sector      = models.CharField(max_length=100)
    description = models.TextField()
    updated_by  = models.ForeignKey(
        "accounts.User", null=True, blank=True,
        on_delete=models.SET_NULL, related_name="+",
    )

    panels = [
        FieldPanel("title"),
        FieldPanel("authority"),
        MultiFieldPanel([
            FieldPanel("deadline"),
            FieldPanel("value"),
            FieldPanel("status"),
            FieldPanel("sector"),
        ], heading="Details"),
        FieldPanel("description"),
    ]

    def __str__(self):
        return self.title

    class Meta:
        ordering = ["status", "title"]


@register_snippet
class Whitepaper(models.Model):
    title         = models.CharField(max_length=255)
    category      = models.CharField(max_length=100)
    category_bg   = models.CharField(max_length=20, help_text="Hex bg e.g. '#eef2ff'")
    category_text = models.CharField(max_length=20, help_text="Hex text e.g. '#432dd7'")
    date          = models.DateField()
    pages         = models.CharField(max_length=30, help_text="e.g. '38 pages'")
    description   = models.TextField()
    document      = models.ForeignKey(
        "wagtaildocs.Document", null=True, blank=True,
        on_delete=models.SET_NULL, related_name="+",
    )
    updated_by    = models.ForeignKey(
        "accounts.User", null=True, blank=True,
        on_delete=models.SET_NULL, related_name="+",
    )

    panels = [
        FieldPanel("title"),
        MultiFieldPanel([
            FieldPanel("category"),
            FieldPanel("category_bg"),
            FieldPanel("category_text"),
            FieldPanel("date"),
            FieldPanel("pages"),
        ], heading="Metadata"),
        FieldPanel("description"),
        FieldPanel("document"),
    ]

    def __str__(self):
        return self.title

    class Meta:
        ordering = ["-date"]


@register_snippet
class VideoItem(models.Model):
    title               = models.CharField(max_length=255)
    category            = models.CharField(max_length=100)
    category_color      = models.CharField(max_length=20, help_text="Hex bg")
    category_text_color = models.CharField(max_length=20, help_text="Hex text")
    date                = models.DateField()
    duration            = models.CharField(max_length=20, help_text="e.g. '14:32 min'")
    excerpt             = models.TextField()
    image               = models.ForeignKey(
        "wagtailimages.Image", null=True, blank=True,
        on_delete=models.SET_NULL, related_name="+",
    )
    video_url           = models.URLField(blank=True)
    required_tier       = models.ForeignKey(
        "accounts.MembershipTier", null=True, blank=True,
        on_delete=models.SET_NULL, related_name="+",
        help_text="Leave blank for public access. Set to require this tier or higher.",
    )

    panels = [
        FieldPanel("title"),
        MultiFieldPanel([
            FieldPanel("category"),
            FieldPanel("category_color"),
            FieldPanel("category_text_color"),
            FieldPanel("date"),
            FieldPanel("duration"),
        ], heading="Metadata"),
        FieldPanel("image"),
        FieldPanel("excerpt"),
        FieldPanel("video_url"),
        FieldPanel("required_tier"),
    ]

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = "Video"
        ordering = ["-date"]


@register_snippet
class BlogPost(models.Model):
    title   = models.CharField(max_length=255)
    topic   = models.CharField(max_length=100, help_text="e.g. 'Policy', 'Engineering'")
    date    = models.DateField()
    excerpt = models.TextField()
    image   = models.ForeignKey(
        "wagtailimages.Image", null=True, blank=True,
        on_delete=models.SET_NULL, related_name="+",
    )
    body    = StreamField([
        ("rich_text", RichTextBlock()),
        ("image", blocks.StructBlock([
            ("image", blocks.CharBlock(help_text="Image URL or path")),
            ("caption", blocks.CharBlock(required=False)),
        ])),
    ], blank=True, use_json_field=True)

    panels = [
        FieldPanel("title"),
        MultiFieldPanel([
            FieldPanel("topic"),
            FieldPanel("date"),
        ], heading="Metadata"),
        FieldPanel("image"),
        FieldPanel("excerpt"),
        FieldPanel("body"),
    ]

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = "Blog Post"
        ordering = ["-date"]


@register_snippet
class PodcastEpisode(models.Model):
    title         = models.CharField(max_length=255)
    category      = models.CharField(max_length=100)
    category_bg   = models.CharField(max_length=20, help_text="Hex bg")
    category_text = models.CharField(max_length=20, help_text="Hex text")
    date          = models.DateField()
    duration      = models.CharField(max_length=20, help_text="e.g. '48 min'")
    description   = models.TextField()
    guest         = models.CharField(max_length=200)
    guest_role    = models.CharField(max_length=300)
    guest_user    = models.ForeignKey(
        "accounts.User", null=True, blank=True,
        on_delete=models.SET_NULL, related_name="podcast_appearances",
        help_text="Link to a GeLearn account if the guest has one, to show this episode on their profile.",
    )
    image         = models.ForeignKey(
        "wagtailimages.Image", null=True, blank=True,
        on_delete=models.SET_NULL, related_name="+",
    )
    audio_url     = models.URLField(blank=True)
    required_tier = models.ForeignKey(
        "accounts.MembershipTier", null=True, blank=True,
        on_delete=models.SET_NULL, related_name="+",
        help_text="Leave blank for public access. Set to require this tier or higher.",
    )

    panels = [
        FieldPanel("title"),
        MultiFieldPanel([
            FieldPanel("category"),
            FieldPanel("category_bg"),
            FieldPanel("category_text"),
            FieldPanel("date"),
            FieldPanel("duration"),
        ], heading="Metadata"),
        MultiFieldPanel([
            FieldPanel("guest"),
            FieldPanel("guest_role"),
            FieldPanel("guest_user"),
        ], heading="Guest"),
        FieldPanel("image"),
        FieldPanel("description"),
        FieldPanel("audio_url"),
        FieldPanel("required_tier"),
    ]

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = "Podcast Episode"
        ordering = ["-date"]


# ---------------------------------------------------------------------------
# Contact & Job snippets (form submissions / applications)
# ---------------------------------------------------------------------------

@register_snippet
class ContactLead(models.Model):
    name         = models.CharField(max_length=200)
    email        = models.EmailField()
    company      = models.CharField(max_length=200, blank=True)
    phone        = models.CharField(max_length=30, blank=True)
    project_type = models.CharField(max_length=100, blank=True)
    message      = models.TextField()
    created_at   = models.DateTimeField(auto_now_add=True)

    panels = [
        FieldPanel("name"),
        FieldPanel("email"),
        FieldPanel("company"),
        FieldPanel("phone"),
        FieldPanel("project_type"),
        FieldPanel("message"),
    ]

    def __str__(self):
        return f"{self.name} — {self.email} ({self.created_at:%Y-%m-%d})"

    class Meta:
        verbose_name = "Contact Lead"
        ordering = ["-created_at"]


@register_snippet
class JobApplication(models.Model):
    job         = models.ForeignKey(JobPage, null=True, blank=True, on_delete=models.SET_NULL, related_name="applications")
    name        = models.CharField(max_length=200)
    email       = models.EmailField()
    phone       = models.CharField(max_length=30, blank=True)
    linkedin    = models.URLField(blank=True)
    portfolio   = models.URLField(blank=True)
    experience  = models.CharField(max_length=100, blank=True)
    message     = models.TextField(blank=True)
    resume      = models.ForeignKey(
        "wagtaildocs.Document", null=True, blank=True,
        on_delete=models.SET_NULL, related_name="+",
    )
    created_at  = models.DateTimeField(auto_now_add=True)

    panels = [
        FieldPanel("job"),
        FieldPanel("name"),
        FieldPanel("email"),
        FieldPanel("phone"),
        FieldPanel("linkedin"),
        FieldPanel("portfolio"),
        FieldPanel("experience"),
        FieldPanel("message"),
        FieldPanel("resume"),
    ]

    def __str__(self):
        return f"{self.name} — {self.job or 'General'} ({self.created_at:%Y-%m-%d})"

    class Meta:
        verbose_name = "Job Application"
        ordering = ["-created_at"]


# ---------------------------------------------------------------------------
# User-submitted blog posts (UGC) — reviewed by an admin before being copied
# into the CMS-curated BlogPost list. Kept separate from BlogPost so the
# editorial team retains full control over what's publicly visible.
# ---------------------------------------------------------------------------

@register_snippet
class UserBlogPost(models.Model):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("pending", "Pending Review"),
        ("published", "Published"),
        ("rejected", "Rejected"),
    ]

    author = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="blog_submissions",
    )
    title = models.CharField(max_length=255)
    excerpt = models.TextField()
    body = models.TextField()
    topic = models.CharField(max_length=100, blank=True)
    image = models.ForeignKey(
        "wagtailimages.Image", null=True, blank=True,
        on_delete=models.SET_NULL, related_name="+",
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="draft")
    rejection_reason = models.TextField(blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        "accounts.User", null=True, blank=True,
        on_delete=models.SET_NULL, related_name="+",
    )
    published_post = models.OneToOneField(
        "pages.BlogPost", null=True, blank=True,
        on_delete=models.SET_NULL, related_name="submission_source",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    panels = [
        FieldPanel("title"),
        FieldPanel("topic"),
        FieldPanel("excerpt"),
        FieldPanel("image"),
        FieldPanel("body"),
        MultiFieldPanel([
            FieldPanel("status"),
            FieldPanel("rejection_reason"),
        ], heading="Review"),
    ]

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"

    class Meta:
        verbose_name = "User Blog Submission"
        ordering = ["-created_at"]


@register_snippet
class UserVideoPost(models.Model):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("pending", "Pending Review"),
        ("published", "Published"),
        ("rejected", "Rejected"),
    ]

    author = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="video_submissions",
    )
    title = models.CharField(max_length=255)
    excerpt = models.TextField()
    video_url = models.URLField(help_text="YouTube/Vimeo/CDN link — matches VideoItem.video_url")
    topic = models.CharField(max_length=100, blank=True)
    thumbnail = models.ForeignKey(
        "wagtailimages.Image", null=True, blank=True,
        on_delete=models.SET_NULL, related_name="+",
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="draft")
    rejection_reason = models.TextField(blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        "accounts.User", null=True, blank=True,
        on_delete=models.SET_NULL, related_name="+",
    )
    published_video = models.OneToOneField(
        "pages.VideoItem", null=True, blank=True,
        on_delete=models.SET_NULL, related_name="submission_source",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    panels = [
        FieldPanel("title"),
        FieldPanel("topic"),
        FieldPanel("excerpt"),
        FieldPanel("video_url"),
        FieldPanel("thumbnail"),
        MultiFieldPanel([
            FieldPanel("status"),
            FieldPanel("rejection_reason"),
        ], heading="Review"),
    ]

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"

    class Meta:
        verbose_name = "User Video Submission"
        ordering = ["-created_at"]
