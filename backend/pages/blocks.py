from wagtail import blocks
from wagtail.images.blocks import ImageChooserBlock
from wagtail.documents.blocks import DocumentChooserBlock

# ---------------------------------------------------------------------------
# Icon choices — MUI icon names used in the Genex frontend
# ---------------------------------------------------------------------------
ICON_CHOICES = [
    # About / Mission / Vision
    ("LanguageOutlined", "Language / Globe"),
    ("ShieldOutlined", "Shield"),
    ("VerifiedOutlined", "Verified"),
    ("BoltOutlined", "Bolt (outlined)"),
    ("SecurityOutlined", "Security"),
    ("CheckCircleOutlined", "Check Circle"),
    # GeLearn teaser (Outlined variants)
    ("EngineeringOutlined", "Engineering"),
    ("MemoryOutlined", "Memory"),
    ("DescriptionOutlined", "Description"),
    ("GavelOutlined", "Gavel"),
    ("ArticleOutlined", "Article"),
    ("PlayCircleOutlined", "Play Circle"),
    ("RssFeedOutlined", "RSS Feed"),
    ("HelpOutlined", "Help / FAQ"),
    ("MicOutlined", "Microphone / Podcast"),
    # Careers
    ("Bolt", "Bolt (filled)"),
    ("TrendingUp", "Trending Up"),
    ("Groups", "Groups / Team"),
    # Contact
    ("LocationOn", "Location"),
    ("Phone", "Phone"),
    ("Email", "Email"),
    ("Chat", "Chat / WhatsApp"),
    # Energy & Power
    ("ElectricBolt", "Electric Bolt"),
    ("SolarPower", "Solar Power"),
    ("WindPower", "Wind Power"),
    ("BatteryChargingFull", "Battery"),
    ("EvStation", "EV Station"),
    # Tech & Analytics
    ("Analytics", "Analytics"),
    ("Dashboard", "Dashboard"),
    ("Memory", "Memory"),
    ("Storage", "Server / Storage"),
    ("Cloud", "Cloud"),
    ("Wifi", "IoT / Wifi"),
    ("Psychology", "AI / Brain"),
    ("AutoAwesome", "AI / Sparkles"),
    # Business
    ("Business", "Company"),
    ("Factory", "Factory"),
    ("Engineering", "Engineering"),
    ("Science", "R&D"),
    ("CurrencyRupee", "Indian Rupee"),
    ("AccountBalance", "Finance"),
    ("Handshake", "Partnership"),
    ("EmojiObjects", "Innovation"),
    ("Timeline", "Timeline"),
    ("Star", "Star"),
    ("Work", "Jobs"),
    # Awards
    ("WorkspacePremiumOutlined", "Award / Premium"),
    ("EmojiEventsOutlined", "Trophy / Event"),
    ("LinkedIn", "LinkedIn"),
]


# ---------------------------------------------------------------------------
# Base class — serialises ImageChooserBlock to {url: ...} in API output
# ---------------------------------------------------------------------------
class ImageApiStructBlock(blocks.StructBlock):
    """Serialises ImageChooserBlock/DocumentChooserBlock child fields to {url: ...} in API output.

    Used for any block with a media chooser field (images, or uploaded video/PDF documents)
    so the frontend gets a ready-to-use absolute-relative URL instead of a raw PK.
    """
    def get_api_representation(self, value, context=None):
        data = super().get_api_representation(value, context)
        for field_name, field in self.child_blocks.items():
            if isinstance(field, ImageChooserBlock) and value.get(field_name):
                img = value[field_name]
                data[field_name] = {"url": img.file.url, "width": img.width, "height": img.height, "alt": img.title}
            elif isinstance(field, DocumentChooserBlock) and value.get(field_name):
                doc = value[field_name]
                data[field_name] = {"url": doc.url, "title": doc.title}
        return data


# ===========================================================================
# SECTION A — Primitive / Shared Blocks
# ===========================================================================

class StatBlock(blocks.StructBlock):
    """Maps to { value, suffix, label } in ImpactNumbers, product stats, etc."""
    value  = blocks.CharBlock()
    suffix = blocks.CharBlock(required=False)
    label  = blocks.CharBlock()

    class Meta:
        icon = "order"


class CTABandBlock(blocks.StructBlock):
    heading            = blocks.CharBlock()
    description        = blocks.TextBlock(required=False)
    primary_cta_text   = blocks.CharBlock(required=False)
    primary_cta_link   = blocks.CharBlock(required=False)
    secondary_cta_text = blocks.CharBlock(required=False)
    secondary_cta_link = blocks.CharBlock(required=False)

    class Meta:
        icon = "pick"


class BulletPointBlock(blocks.StructBlock):
    bold_title = blocks.CharBlock()
    point      = blocks.TextBlock()

    class Meta:
        icon = "list-ul"


# ===========================================================================
# SECTION B — Homepage-Specific Blocks
# ===========================================================================

class HeroSlideBlock(ImageApiStructBlock):
    """Maps to the Slide interface in HeroSlideshow.tsx"""
    headline         = blocks.CharBlock()
    subline          = blocks.TextBlock(required=False)
    media_type       = blocks.ChoiceBlock(
        choices=[("video", "Video"), ("image", "Image")],
        default="image",
    )
    background_image = ImageChooserBlock(required=False)
    background_video = DocumentChooserBlock(required=False, help_text="Upload a video file (mp4) for this slide")
    cta_text         = blocks.CharBlock(required=False)
    cta_link         = blocks.CharBlock(required=False)

    class Meta:
        icon = "image"


class CredibilityLogoBlock(ImageApiStructBlock):
    """Client logo shown in the homepage trust strip. Name is alt-text only, never rendered."""
    name = blocks.CharBlock(help_text="Client name — used for accessible alt text only, not displayed")
    logo = ImageChooserBlock(help_text="Small logo, ideally transparent background")

    class Meta:
        icon = "image"


class WhatWeBuildTabBlock(ImageApiStructBlock):
    """Maps to { id, label, badge?, headline, body, points[], href, image } in WhatWeBuild.tsx"""
    id       = blocks.CharBlock(help_text="Unique slug matching portfolio product e.g. 'solarlive'")
    label    = blocks.CharBlock()
    badge    = blocks.CharBlock(required=False)
    headline = blocks.CharBlock()
    body     = blocks.TextBlock()
    points   = blocks.ListBlock(blocks.CharBlock(), help_text="3 bullet points")
    href     = blocks.CharBlock(help_text="/portfolio/<slug>")
    image    = ImageChooserBlock(required=False)

    class Meta:
        icon = "list-ul"


class StatementBlock(blocks.StructBlock):
    """Maps to Statement in GenexEdge.tsx — title + body only (no icon)."""
    title = blocks.CharBlock()
    body  = blocks.TextBlock()

    class Meta:
        icon = "edit"


class GenexEdgeSectionBlock(ImageApiStructBlock):
    """The 'Why Genex' split section — image on one side, statements on the other. Limited to one per page."""
    heading    = blocks.CharBlock(required=False, default="Why Genex.", help_text="Section title shown above the statements")
    image      = ImageChooserBlock(required=False, help_text="Control room image")
    statements = blocks.ListBlock(StatementBlock(), min_num=1)

    class Meta:
        icon = "grip"


class ProjectShowcaseItemBlock(ImageApiStructBlock):
    """Maps to Project in ProjectsAtScale.tsx. Card background gradient is hardcoded in the frontend, not editable."""
    name     = blocks.CharBlock()
    location = blocks.CharBlock(required=False)
    metric   = blocks.CharBlock(required=False)
    image    = ImageChooserBlock(required=False)
    href     = blocks.CharBlock(required=False)

    class Meta:
        icon = "site"


class InnovationsTeaserItemBlock(blocks.StructBlock):
    """Simpler shape used on the homepage teaser (not the full InnovationPage)."""
    name    = blocks.CharBlock()
    tagline = blocks.CharBlock()
    href    = blocks.CharBlock()
    badge   = blocks.CharBlock(required=False)
    index   = blocks.IntegerBlock(help_text="1-based display number")

    class Meta:
        icon = "snippet"


class TechPartnerBlock(ImageApiStructBlock):
    """Maps to { name, abbr, href, logo } in TechPartners.tsx. Falls back to the abbr text pill when no logo is set."""
    name = blocks.CharBlock(help_text="Full name e.g. 'Amazon Web Services'")
    abbr = blocks.CharBlock(help_text="Short display name e.g. 'AWS'")
    href = blocks.URLBlock(required=False)
    logo = ImageChooserBlock(required=False, help_text="Small partner/standard logo — shown instead of the abbreviation text")

    class Meta:
        icon = "link"


class TestimonialItemBlock(blocks.StructBlock):
    """Maps to { quote, name, role, company, initials } — initials-based avatar."""
    quote    = blocks.TextBlock()
    name     = blocks.CharBlock()
    role     = blocks.CharBlock(required=False)
    company  = blocks.CharBlock(required=False)
    initials = blocks.CharBlock(max_length=2, help_text="2-letter avatar e.g. 'AS'")

    class Meta:
        icon = "openquote"


class GeLearnTeaserCardBlock(blocks.StructBlock):
    """Maps to CATEGORIES in GeLearnTeaser.tsx — 9 hub tiles. Tile color/icon-badge styling
    is hardcoded in the frontend (identical for every tile), not editor-controlled."""
    slug  = blocks.CharBlock(help_text="URL slug e.g. 'how-we-work'")
    label = blocks.CharBlock()
    icon  = blocks.ChoiceBlock(choices=ICON_CHOICES)

    class Meta:
        icon = "folder-open-inverse"


class MapPinBlock(blocks.StructBlock):
    """A pin on the WorldOperationsMap SVG."""
    id        = blocks.CharBlock(max_length=5, help_text="Country code e.g. 'IN', 'US'")
    name      = blocks.CharBlock()
    latitude  = blocks.FloatBlock()
    longitude = blocks.FloatBlock()
    delay     = blocks.FloatBlock(required=False, default=0.0)

    class Meta:
        icon = "site"


class WorldMapSectionBlock(blocks.StructBlock):
    """The 'Operating Worldwide' section — copy, stats strip, and pins are all editor-managed."""
    eyebrow       = blocks.CharBlock(required=False, default="Global Presence", help_text="Small label above the heading")
    heading       = blocks.CharBlock(required=False, default="Operating Worldwide.")
    description   = blocks.ListBlock(blocks.TextBlock(), required=False, default=[], help_text="Paragraphs shown under the heading")
    bullet_points = blocks.ListBlock(blocks.CharBlock(), required=False, default=[])
    stats         = blocks.ListBlock(StatBlock(), help_text="Stats strip — add or remove freely")
    pins          = blocks.ListBlock(MapPinBlock(), min_num=1)

    class Meta:
        icon = "globe"


class EventBannerBlock(blocks.StructBlock):
    title            = blocks.CharBlock()
    date             = blocks.DateTimeBlock()
    tagline          = blocks.CharBlock()
    description      = blocks.TextBlock(required=False)
    registration_url = blocks.URLBlock()

    class Meta:
        icon = "date"


# ===========================================================================
# SECTION C — Product / Innovation Page Blocks
# ===========================================================================

class TechHighlightBlock(blocks.StructBlock):
    """Maps exactly to { title, description } in techHighlights arrays."""
    title       = blocks.CharBlock(help_text="e.g. 'Protocol Support'")
    description = blocks.CharBlock(help_text="e.g. 'Modbus, DNP3, IEC 61850'")

    class Meta:
        icon = "tag"


# ===========================================================================
# SECTION C-2 — Product / Innovation Body Blocks (flexible `body` StreamField)
# ===========================================================================
#
# Wrapper blocks below carry forward the exact content shape of ProductPage/
# InnovationPage's old bare `overview`/`capabilities`/`tech_highlights` fields,
# so a data migration can map old values onto these 1:1 with no visual change.
# The remaining blocks are new, original additions for these two page types —
# inspired by SolarLive's step/video/testimonial-style sections but re-scoped
# for a B2B power-sector engineering audience (proof/outcomes, not marketing).

class OverviewSectionBlock(blocks.StructBlock):
    heading    = blocks.CharBlock(required=False, default="Overview")
    paragraphs = blocks.ListBlock(blocks.TextBlock(), min_num=1)

    class Meta:
        icon = "doc-full"
        label = "Overview Section"


class CapabilitiesSectionBlock(blocks.StructBlock):
    heading = blocks.CharBlock(required=False, default="Capabilities")
    items   = blocks.ListBlock(blocks.CharBlock(), min_num=1)

    class Meta:
        icon = "list-ul"
        label = "Capabilities Section"


class TechHighlightsSectionBlock(blocks.StructBlock):
    eyebrow = blocks.CharBlock(required=False, default="Built for Reliability")
    intro   = blocks.TextBlock(
        required=False,
        default="Purpose-engineered for the complexity of India's power infrastructure — built to last and scale.",
    )
    items   = blocks.ListBlock(TechHighlightBlock(), min_num=1)

    class Meta:
        icon = "tag"
        label = "Tech Highlights Section"


class DeploymentStepBlock(blocks.StructBlock):
    """One step in a commissioning/integration sequence — not a generic marketing step."""
    num         = blocks.CharBlock(max_length=3, help_text="'01', '02', etc.")
    title       = blocks.CharBlock()
    description = blocks.TextBlock()
    icon        = blocks.ChoiceBlock(choices=ICON_CHOICES, required=False)

    class Meta:
        icon = "order"
        label = "Deployment Step"


class DeploymentStepsSectionBlock(blocks.StructBlock):
    heading     = blocks.CharBlock(required=False, default="How It's Deployed")
    description = blocks.TextBlock(required=False)
    steps       = blocks.ListBlock(DeploymentStepBlock(), min_num=1)

    class Meta:
        icon = "order"
        label = "Deployment Steps Section"


class ProductVideoSectionBlock(ImageApiStructBlock):
    """Demo/commissioning video — either an uploaded mp4 or a hosted URL."""
    heading      = blocks.CharBlock(required=False)
    description  = blocks.TextBlock(required=False)
    video_file   = DocumentChooserBlock(required=False, help_text="Upload an mp4 file")
    video_url    = blocks.URLBlock(required=False, help_text="…or a hosted video URL (YouTube/Vimeo/CDN) instead of uploading")
    poster_image = ImageChooserBlock(required=False, help_text="Thumbnail shown before play")

    class Meta:
        icon = "media"
        label = "Video Section"


class ProductTestimonialSectionBlock(blocks.StructBlock):
    """Per-product client testimonials — reuses the existing TestimonialItemBlock."""
    heading = blocks.CharBlock(required=False, default="What Our Clients Say")
    items   = blocks.ListBlock(TestimonialItemBlock(), min_num=1)

    class Meta:
        icon = "openquote"
        label = "Testimonials Section"


# ===========================================================================
# SECTION D — Inner Page / GeLearn / About / Careers / Contact Blocks
# ===========================================================================

class HeroSectionBlock(ImageApiStructBlock):
    """Standard inner-page hero with optional CTA."""
    label            = blocks.CharBlock(required=False, help_text="Eyebrow label above headline")
    heading          = blocks.CharBlock()
    description      = blocks.TextBlock(required=False)
    cta_text         = blocks.CharBlock(required=False)
    cta_link         = blocks.CharBlock(required=False)
    background_image = ImageChooserBlock(required=False)

    class Meta:
        icon = "title"


class HowWeWorkStepBlock(ImageApiStructBlock):
    """Exact match for Step interface in HowWeWork.tsx."""
    num             = blocks.CharBlock(max_length=3, help_text="'01' through '06'")
    title           = blocks.CharBlock()
    desc            = blocks.TextBlock()
    badge_color     = blocks.CharBlock(help_text="Hex color for step number badge")
    dot_color       = blocks.CharBlock(help_text="Hex color for timeline dot border")
    connector_color = blocks.CharBlock(help_text="Hex color for connector line")
    card_border     = blocks.CharBlock(help_text="Hex color for card border")
    image           = ImageChooserBlock(required=False)
    side            = blocks.ChoiceBlock(
        choices=[("right", "Right"), ("left", "Left")],
        default="right",
    )

    class Meta:
        icon = "order"


class EngineeringPrincipleBlock(blocks.StructBlock):
    title = blocks.CharBlock()
    desc  = blocks.TextBlock()

    class Meta:
        icon = "edit"


class HowWeWorkPageBlock(blocks.StructBlock):
    steps      = blocks.ListBlock(HowWeWorkStepBlock(), min_num=1)
    principles = blocks.ListBlock(EngineeringPrincipleBlock(), required=False)

    class Meta:
        icon = "list-ul"


class MilestoneBlock(blocks.StructBlock):
    """About page timeline milestone."""
    year        = blocks.CharBlock(max_length=10)
    label       = blocks.CharBlock(help_text="Uppercase tagline e.g. 'THE BEGINNING'")
    title       = blocks.CharBlock()
    description = blocks.TextBlock()
    is_current  = blocks.BooleanBlock(required=False, default=False)

    class Meta:
        icon = "date"


class VisionMissionCardBlock(blocks.StructBlock):
    icon  = blocks.ChoiceBlock(choices=ICON_CHOICES)
    title = blocks.CharBlock()
    text  = blocks.TextBlock()

    class Meta:
        icon = "snippet"


class LeadershipCardBlock(blocks.StructBlock):
    """About page leadership — no name field (frontend omits names)."""
    title    = blocks.CharBlock(help_text="Job title e.g. 'Founder & CEO'")
    bio      = blocks.TextBlock()
    initials = blocks.CharBlock(max_length=2, help_text="Avatar initials e.g. 'G'")
    linkedin = blocks.URLBlock(required=False)

    class Meta:
        icon = "user"


class CertificationBlock(blocks.StructBlock):
    """Maps to { name, label } in About — name is cert code, label is description."""
    name  = blocks.CharBlock(help_text="e.g. 'ISO 9001:2015'")
    label = blocks.CharBlock(help_text="e.g. 'Quality Management System'")

    class Meta:
        icon = "success"


class AchievementBlock(ImageApiStructBlock):
    """About/Media achievement/award card."""
    badge      = blocks.CharBlock(help_text="'Certificate' or 'Award'")
    icon_type  = blocks.ChoiceBlock(choices=[("certificate", "Certificate"), ("award", "Award")])
    heading    = blocks.CharBlock()
    body       = blocks.RichTextBlock()
    image      = ImageChooserBlock(required=False)
    image_alt  = blocks.CharBlock(required=False)

    class Meta:
        icon = "star-full-inverse"


class PressItemBlock(ImageApiStructBlock):
    """About/Media bento grid press item."""
    image      = ImageChooserBlock()
    alt        = blocks.CharBlock()
    caption    = blocks.CharBlock(required=False)
    subcaption = blocks.CharBlock(required=False)
    featured   = blocks.BooleanBlock(required=False, default=False)

    class Meta:
        icon = "image"


class GalleryItemBlock(ImageApiStructBlock):
    """About/Media masonry gallery item."""
    image = ImageChooserBlock()
    alt   = blocks.CharBlock()

    class Meta:
        icon = "image"


class TeamMemberBlock(ImageApiStructBlock):
    """Maps to TeamMember interface in About/Team."""
    name  = blocks.CharBlock()
    role  = blocks.CharBlock()
    image = ImageChooserBlock(required=False)

    class Meta:
        icon = "user"


class LeaderBlock(ImageApiStructBlock):
    """Founder/leader spotlight block."""
    name  = blocks.CharBlock()
    role  = blocks.CharBlock()
    image = ImageChooserBlock(required=False)
    quote = blocks.TextBlock()

    class Meta:
        icon = "user"


class TeamSectionBlock(blocks.StructBlock):
    """A named group of team members (Dev Team, Ops Team, etc.)."""
    title       = blocks.CharBlock()
    description = blocks.TextBlock(required=False)
    members     = blocks.ListBlock(TeamMemberBlock(), min_num=1)

    class Meta:
        icon = "group"


class WhyGenexCardBlock(blocks.StructBlock):
    """Careers 'Why Genex' benefit cards."""
    icon        = blocks.ChoiceBlock(choices=ICON_CHOICES)
    title       = blocks.CharBlock()
    description = blocks.TextBlock()

    class Meta:
        icon = "snippet"


class OpenRoleBlock(blocks.StructBlock):
    """Careers open job listing."""
    title       = blocks.CharBlock()
    department  = blocks.CharBlock()
    location    = blocks.CharBlock()
    type        = blocks.CharBlock(help_text="e.g. 'Full-time'")
    description = blocks.TextBlock()

    class Meta:
        icon = "doc-full"


class ContactDetailBlock(blocks.StructBlock):
    """Maps to CONTACT_DETAILS in Contact.tsx."""
    icon  = blocks.ChoiceBlock(choices=ICON_CHOICES)
    label = blocks.CharBlock()
    lines = blocks.ListBlock(blocks.CharBlock())
    note  = blocks.CharBlock(required=False, help_text="e.g. 'Mon–Sat · 10am–7pm IST'")

    class Meta:
        icon = "mail"


class ProjectTypeChoiceBlock(blocks.StructBlock):
    """Contact form project type dropdown options."""
    value = blocks.CharBlock()
    label = blocks.CharBlock()

    class Meta:
        icon = "list-ul"


# ---------------------------------------------------------------------------
# Reused / adapted from SolarLive
# ---------------------------------------------------------------------------

class SimpleCardBlock(blocks.StructBlock):
    icon        = blocks.ChoiceBlock(choices=ICON_CHOICES, required=False)
    title       = blocks.CharBlock()
    description = blocks.TextBlock()
    note        = blocks.CharBlock(required=False)
    link        = blocks.CharBlock(required=False)
    gradient    = blocks.CharBlock(required=False)
    icon_bg     = blocks.CharBlock(required=False)

    class Meta:
        icon = "snippet"


class CardGridSectionBlock(blocks.StructBlock):
    heading     = blocks.CharBlock(required=False)
    description = blocks.TextBlock(required=False)
    cards       = blocks.ListBlock(SimpleCardBlock(), min_num=1)

    class Meta:
        icon = "grip"


class StatsGridSectionBlock(blocks.StructBlock):
    heading = blocks.CharBlock(required=False)
    bg      = blocks.CharBlock(required=False, help_text="Tailwind bg class e.g. 'bg-primary'")
    stats   = blocks.ListBlock(StatBlock(), min_num=1)

    class Meta:
        icon = "order"


class SideImageBlock(ImageApiStructBlock):
    image    = ImageChooserBlock()
    alt      = blocks.CharBlock(required=False)
    position = blocks.ChoiceBlock(
        choices=[("left", "Left"), ("right", "Right")],
        default="right",
    )

    class Meta:
        icon = "image"


class SideImageSectionBlock(blocks.StructBlock):
    heading     = blocks.CharBlock(required=False)
    description = blocks.RichTextBlock(required=False)
    image       = SideImageBlock()
    body_blocks = blocks.StreamBlock(
        [("bullet", BulletPointBlock()), ("text", blocks.TextBlock())],
        required=False,
    )

    class Meta:
        icon = "image"


class IntroductionSectionBlock(blocks.StructBlock):
    heading     = blocks.CharBlock(required=False)
    description = blocks.RichTextBlock()
    note        = blocks.CharBlock(required=False)

    class Meta:
        icon = "title"


class FAQItemBlock(blocks.StructBlock):
    section = blocks.CharBlock(required=False, help_text="e.g. 'General Questions'")
    q       = blocks.CharBlock()
    a       = blocks.TextBlock()

    class Meta:
        icon = "help"


class FAQSectionBlock(blocks.StructBlock):
    heading = blocks.CharBlock(required=False)
    items   = blocks.ListBlock(FAQItemBlock(), min_num=1)

    class Meta:
        icon = "help"


class TimelineItemBlock(blocks.StructBlock):
    period      = blocks.CharBlock(help_text="Year or date range")
    title       = blocks.CharBlock()
    description = blocks.TextBlock(required=False)

    class Meta:
        icon = "date"


class TimelineSectionBlock(blocks.StructBlock):
    heading = blocks.CharBlock(required=False)
    items   = blocks.ListBlock(TimelineItemBlock(), min_num=1)

    class Meta:
        icon = "date"


class DocumentItemBlock(ImageApiStructBlock):
    title    = blocks.CharBlock()
    document = DocumentChooserBlock(required=False)
    note     = blocks.CharBlock(required=False)

    class Meta:
        icon = "doc-full"


class DocumentSectionBlock(blocks.StructBlock):
    heading   = blocks.CharBlock(required=False)
    documents = blocks.ListBlock(DocumentItemBlock(), min_num=1)

    class Meta:
        icon = "doc-full"


class MapEmbedBlock(blocks.StructBlock):
    """Google Maps embed — used on Contact page."""
    embed_url  = blocks.URLBlock(help_text="Google Maps embed URL")
    zoom_level = blocks.IntegerBlock(required=False, default=15)

    class Meta:
        icon = "site"


class AppDownloadBlock(blocks.StructBlock):
    heading      = blocks.CharBlock(required=False)
    description  = blocks.TextBlock(required=False)
    play_store   = blocks.URLBlock(required=False)
    app_store    = blocks.URLBlock(required=False)

    class Meta:
        icon = "mobile-alt"
