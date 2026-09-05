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
    def get_api_representation(self, value, context=None):
        data = super().get_api_representation(value, context)
        for field_name, field in self.child_blocks.items():
            if isinstance(field, ImageChooserBlock) and value.get(field_name):
                img = value[field_name]
                data[field_name] = {"url": img.file.url, "width": img.width, "height": img.height, "alt": img.title}
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
    background_video = blocks.URLBlock(required=False)
    cta_text         = blocks.CharBlock(required=False)
    cta_link         = blocks.CharBlock(required=False)

    class Meta:
        icon = "image"


class CredibilityNameBlock(blocks.StructBlock):
    """Simple string name — frontend uses string[] with no logos yet."""
    name = blocks.CharBlock()

    class Meta:
        icon = "tag"


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
    """The 'Why Genex' split section — image on one side, statements on the other."""
    heading    = blocks.CharBlock(required=False)
    image      = ImageChooserBlock(required=False, help_text="Control room image")
    statements = blocks.ListBlock(StatementBlock(), min_num=1)

    class Meta:
        icon = "grip"


class ProjectShowcaseItemBlock(ImageApiStructBlock):
    """Maps to Project in ProjectsAtScale.tsx — gradient is raw CSS string."""
    name     = blocks.CharBlock()
    location = blocks.CharBlock(required=False)
    metric   = blocks.CharBlock(required=False)
    image    = ImageChooserBlock(required=False)
    href     = blocks.CharBlock(required=False)
    gradient = blocks.CharBlock(
        required=False,
        help_text="CSS linear-gradient string e.g. linear-gradient(160deg, #1a2d0a, #2a4a15)",
    )

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


class TechPartnerBlock(blocks.StructBlock):
    """Maps to { name, abbr, href } in TechPartners.tsx — text-only, no logo."""
    name = blocks.CharBlock(help_text="Full name e.g. 'Amazon Web Services'")
    abbr = blocks.CharBlock(help_text="Short display name e.g. 'AWS'")
    href = blocks.URLBlock(required=False)

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
    """Maps to GELEARN_SECTIONS in GeLearnTeaser.tsx — 9 hub cards."""
    slug        = blocks.CharBlock(help_text="URL slug e.g. 'how-we-work'")
    label       = blocks.CharBlock()
    icon        = blocks.ChoiceBlock(choices=ICON_CHOICES)
    gradient    = blocks.CharBlock(help_text="Tailwind gradient class for card background")
    icon_bg     = blocks.CharBlock(help_text="Tailwind gradient class for icon square background")
    count       = blocks.CharBlock(help_text="e.g. '6 Methodology Steps'")
    description = blocks.TextBlock()

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
    heading       = blocks.CharBlock(required=False)
    pins          = blocks.ListBlock(MapPinBlock(), min_num=1)
    stats         = blocks.ListBlock(StatBlock(), help_text="3 stats strip items")
    bullet_points = blocks.ListBlock(blocks.CharBlock(), required=False)

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


class DocumentItemBlock(blocks.StructBlock):
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
