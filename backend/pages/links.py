"""
Links in the CMS, without typing addresses.

Every link an editor sets (a button, "Show more", a promo, a tile) is a
LinkBlock: they pick *what* to link to, and the address is built here. The API
still sends a plain address string, so the frontend never changes when a link
does.

To extend:
  - A new GeLearn page:        add one row to GELEARN_PAGES.
  - A new search filter:       add one SearchFilter to SEARCH_FILTERS (and teach
                               the frontend /search page the same parameter).
  - A new kind of thing to link to (e.g. a live session): add a chooser block
    to LinkBlock, a LINK_TYPES entry, and a branch in LinkBlock.url_for().
"""
from dataclasses import dataclass
from typing import Callable
from urllib.parse import urlencode

from django import forms
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils.functional import cached_property
from wagtail import blocks
from wagtail.admin.forms.choosers import BaseFilterForm
from wagtail.admin.viewsets.chooser import ChooserViewSet
from wagtail.blocks.struct_block import StructBlockValidationError
from wagtail.snippets.blocks import SnippetChooserBlock

# ── GeLearn pages an editor can pick by name ─────────────────────────────────
# key (stored in the CMS, never change it), label (what editors see), address.
# Renaming a route means changing the address here; every link updates.
GELEARN_PAGES = [
    ("home", "Home", "/"),
    ("courses", "All courses", "/courses"),
    ("search", "Search and catalogue", "/search"),
    ("topics", "All topics", "/topics"),
    ("roles", "All career roles", "/roles"),
    ("live_sessions", "Live sessions", "/live-sessions"),
    ("professionals", "Leading Professionals", "/professionals"),
    ("companies", "All companies", "/companies"),
    ("geacademy", "GeAcademy", "/geacademy"),
    ("research", "Research", "/research"),
    ("policies_tenders", "Policies & Tenders", "/policies-tenders"),
    ("whitepapers", "Whitepapers", "/whitepapers"),
    ("videos", "Videos", "/videos"),
    ("blog", "Blog", "/blog"),
    ("podcasts", "Podcasts", "/podcasts"),
    ("for_professionals", "For Professionals", "/for-professionals"),
    ("for_companies", "For Companies", "/for-companies"),
    ("register", "Sign up", "/register"),
    ("login", "Log in", "/login"),
    ("my_learning", "My Learning (dashboard)", "/account?tab=learning"),
    ("saved", "Saved items (dashboard)", "/account?tab=saved"),
    ("studio", "Company Studio", "/studio"),
]
GELEARN_PAGE_PATHS = {key: path for key, _, path in GELEARN_PAGES}


# ── Search filters ───────────────────────────────────────────────────────────

@dataclass(frozen=True)
class SearchFilter:
    """One filter of the /search page, as editors set it and as it appears in the address."""
    param: str                                   # the ?param= name the /search page reads
    make_block: Callable[[], blocks.Block]       # the CMS field for it (always optional)
    to_param: Callable[[object], str | None]     # the chosen value → the address value (None = not set)


def _choice(label, choices, help_text=""):
    return lambda: blocks.ChoiceBlock(choices=choices, required=False, label=label, help_text=help_text)


def _same(value):
    return value or None


SEARCH_FILTERS = [
    SearchFilter("q", lambda: blocks.CharBlock(required=False, max_length=80, label="Search words",
                                               help_text="Optional, e.g. 'IEC 61850'."), lambda v: (v or "").strip() or None),
    SearchFilter("type", _choice("Content type", [
        ("course", "Courses"), ("geacademy", "GeAcademy articles"), ("research", "Research"),
        ("whitepaper", "Whitepapers"), ("tender", "Policies & Tenders"), ("video", "Videos"),
        ("podcast", "Podcasts"), ("blog", "Blog posts"),
    ]), _same),
    SearchFilter("level", _choice("Level", [
        ("beginner", "Beginner"), ("intermediate", "Intermediate"), ("advanced", "Advanced"),
    ]), _same),
    SearchFilter("access", _choice("Access", [
        ("free", "Free"), ("members", "Members only"), ("paid", "Paid"),
    ]), _same),
    SearchFilter("topic", lambda: SnippetChooserBlock("pages.Topic", required=False, label="Topic"),
                 lambda topic: topic.slug if topic else None),
    SearchFilter("max_minutes", _choice("Maximum length", [
        ("10", "Up to 10 minutes"), ("20", "Up to 20 minutes"), ("30", "Up to 30 minutes"), ("60", "Up to 1 hour"),
    ], "Videos and podcasts only."), _same),
]


class SearchFiltersBlock(blocks.StructBlock):
    """The /search filters as dropdowns and choosers; built from SEARCH_FILTERS."""

    def __init__(self, local_blocks=None, **kwargs):
        local_blocks = list(local_blocks or []) + [(f.param, f.make_block()) for f in SEARCH_FILTERS]
        super().__init__(local_blocks, **kwargs)

    @staticmethod
    def address(value):
        params = []
        for f in SEARCH_FILTERS:
            param_value = f.to_param(value.get(f.param)) if value else None
            if param_value:
                params.append((f.param, param_value))
        return "/search" + (f"?{urlencode(params)}" if params else "")

    class Meta:
        label = "Filters"
        form_classname = "gelearn-link-filters"


# ── Choosers for things that aren't CMS snippets ─────────────────────────────

class NameSearchForm(BaseFilterForm):
    """A plain 'contains' search for chooser lists of models that aren't search-indexed."""
    q = forms.CharField(label="Search term", required=False, widget=forms.TextInput(attrs={"placeholder": "Search"}))
    search_field = "name"

    def filter(self, objects):
        query = (self.cleaned_data.get("q") or "").strip()
        if query:
            self.is_searching, self.search_query = True, query
            objects = objects.filter(**{f"{self.search_field}__icontains": query})
        return objects


class TitleSearchForm(NameSearchForm):
    search_field = "title"


class CompanyChooserViewSet(ChooserViewSet):
    model = "organizations.Company"
    icon = "group"
    choose_one_text = "Choose a company"
    choose_another_text = "Choose another company"
    per_page = 20

    @cached_property
    def choose_view_class(self):
        return _limited_view(super().choose_view_class, NameSearchForm, lambda qs: qs.filter(is_active=True).order_by("name"))

    @cached_property
    def choose_results_view_class(self):
        return _limited_view(super().choose_results_view_class, NameSearchForm, lambda qs: qs.filter(is_active=True).order_by("name"))


class CourseChooserViewSet(ChooserViewSet):
    model = "learning.Playlist"
    icon = "list-ul"
    choose_one_text = "Choose a course"
    choose_another_text = "Choose another course"
    per_page = 20

    @cached_property
    def choose_view_class(self):
        return _limited_view(super().choose_view_class, TitleSearchForm, _published_courses)

    @cached_property
    def choose_results_view_class(self):
        return _limited_view(super().choose_results_view_class, TitleSearchForm, _published_courses)


def _published_courses(qs):
    return qs.filter(status="published").order_by("title")


def _limited_view(base, filter_form_class, limit):
    """A chooser view showing only what `limit` keeps, with a simple name/title search."""
    return type(base.__name__, (base,), {
        "filter_form_class": filter_form_class,
        "get_object_list": lambda self: limit(base.get_object_list(self)),
    })


company_chooser_viewset = CompanyChooserViewSet("company_chooser", url_prefix="choose/company")
course_chooser_viewset = CourseChooserViewSet("course_chooser", url_prefix="choose/course")
CompanyChooserBlock = company_chooser_viewset.get_block_class(name="CompanyChooserBlock", module_path="pages.links")
CourseChooserBlock = course_chooser_viewset.get_block_class(name="CourseChooserBlock", module_path="pages.links")


# ── The link block ───────────────────────────────────────────────────────────

LINK_TYPES = [
    ("page", "A GeLearn page"),
    ("topic", "A topic"),
    ("role", "A career role"),
    ("company", "A company"),
    ("course", "A course"),
    ("search", "Search results with filters"),
    ("genex_page", "A page on the Genex website"),
    ("url", "A web address (outside link)"),
]


class LinkBlock(blocks.StructBlock):
    """
    Pick what to link to; the address is built for you. In the editor only the
    field for the chosen kind of link is shown (see static/pages/js/link_block.js).
    """
    link_type = blocks.ChoiceBlock(choices=LINK_TYPES, default="page", label="Link to")
    page = blocks.ChoiceBlock(choices=[(key, label) for key, label, _ in GELEARN_PAGES], required=False, label="GeLearn page")
    topic = SnippetChooserBlock("pages.Topic", required=False)
    role = SnippetChooserBlock("learning.CareerRole", required=False, label="Career role")
    company = CompanyChooserBlock(required=False)
    course = CourseChooserBlock(required=False)
    search = SearchFiltersBlock()
    genex_page = blocks.PageChooserBlock(
        required=False, label="Genex website page",
        page_type=["pages.HomePage", "pages.SectionPage", "pages.ContentPage", "pages.CareersPage", "pages.ContactPage"],
    )
    url = blocks.CharBlock(required=False, label="Web address", help_text="A full address starting with https://")

    class Meta:
        icon = "link"
        form_classname = "gelearn-link"
        # Optional links get a "No link" choice (the default), so a section can go without one.
        optional = False

    def __init__(self, local_blocks=None, **kwargs):
        super().__init__(local_blocks, **kwargs)
        if self.meta.optional:
            link_type = blocks.ChoiceBlock(choices=[("none", "No link")] + LINK_TYPES, default="none", label="Link to")
            link_type.set_name("link_type")
            self.child_blocks["link_type"] = link_type

    REQUIRED_FIELD = {"page": "page", "topic": "topic", "role": "role", "company": "company",
                      "course": "course", "genex_page": "genex_page", "url": "url"}

    def clean(self, value):
        value = super().clean(value)
        kind = value.get("link_type")
        if kind == "none":
            return value
        field = self.REQUIRED_FIELD.get(kind)
        if field and not value.get(field):
            raise StructBlockValidationError({field: ValidationError("Choose what this link points to.")})
        if kind == "url" and not str(value.get("url", "")).startswith(("https://", "http://")):
            raise StructBlockValidationError({"url": ValidationError("Enter a full address starting with https://")})
        return value

    @staticmethod
    def url_for(value):
        """The address for a chosen link, or "" when it points at nothing (e.g. a deleted topic)."""
        if not value:
            return ""
        kind = value.get("link_type")
        if kind == "page":
            return GELEARN_PAGE_PATHS.get(value.get("page"), "")
        if kind == "topic":
            return f"/topics/{value['topic'].slug}" if value.get("topic") else ""
        if kind == "role":
            return f"/roles/{value['role'].slug}" if value.get("role") else ""
        if kind == "company":
            return f"/c/{value['company'].slug}" if value.get("company") else ""
        if kind == "course":
            course = value.get("course")
            return f"/courses/{course.slug}" if course and course.status == "published" else ""
        if kind == "search":
            return SearchFiltersBlock.address(value.get("search"))
        if kind == "genex_page":
            page = value.get("genex_page")
            return settings.MARKETING_FRONTEND_URL.rstrip("/") + page.url_path if page and page.live else ""
        if kind == "url":
            return value.get("url") or ""
        return ""

    def get_api_representation(self, value, context=None):
        return self.url_for(value)
