"""
Turns the typed link addresses in the GeLearn home sections into picker
choices (pages/links.py LinkBlock), on the page and on every saved revision,
so editors see dropdowns and choosers instead of addresses.

  /for-companies                       → GeLearn page "For Companies"
  /search?type=course&level=beginner   → Search results, Courses, Beginner
  /topics/solar                        → Topic "Solar PV"
  https://…                            → Web address
  anything else                        → "Old typed address" (kept as typed)

Reversible: the reverse turns picker choices back into the same addresses.
"""
import json
from urllib.parse import parse_qsl, urlencode, urlsplit

from django.db import migrations

LINK_KEYS = {"cta_url", "link_url", "see_all_url", "url"}

# Frozen copy of pages.links.GELEARN_PAGES (key → address) as of this migration.
PAGES = {
    "home": "/", "courses": "/courses", "search": "/search", "topics": "/topics", "roles": "/roles",
    "live_sessions": "/live-sessions", "professionals": "/professionals", "companies": "/companies",
    "geacademy": "/geacademy", "research": "/research", "policies_tenders": "/policies-tenders",
    "whitepapers": "/whitepapers", "videos": "/videos", "blog": "/blog", "podcasts": "/podcasts",
    "for_professionals": "/for-professionals", "for_companies": "/for-companies", "register": "/register",
    "login": "/login", "my_learning": "/account?tab=learning", "saved": "/account?tab=saved", "studio": "/studio",
}
PAGE_KEYS = {path: key for key, path in PAGES.items()}
SEARCH_PARAMS = ["q", "type", "level", "access", "topic", "max_minutes"]
CHOOSER_PREFIXES = {"/topics/": ("topic", "pages", "Topic"), "/roles/": ("role", "learning", "CareerRole"),
                    "/c/": ("company", "organizations", "Company"), "/courses/": ("course", "learning", "Playlist")}


def to_link(apps, text):
    text = (text or "").strip()
    if not text:
        return {"link_type": "none"}
    if text.startswith(("http://", "https://")):
        return {"link_type": "url", "url": text}
    if text in PAGE_KEYS:
        return {"link_type": "page", "page": PAGE_KEYS[text]}
    parts = urlsplit(text)
    if parts.path == "/search":
        filters = {}
        for name, value in parse_qsl(parts.query):
            if name == "topic":
                topic = apps.get_model("pages", "Topic").objects.filter(slug=value).first()
                if topic is None:
                    return {"link_type": "legacy", "url": text}
                filters["topic"] = topic.pk
            elif name in SEARCH_PARAMS:
                filters[name] = value
            else:
                return {"link_type": "legacy", "url": text}
        return {"link_type": "search", "search": filters}
    for prefix, (field, app, model) in CHOOSER_PREFIXES.items():
        if parts.path.startswith(prefix) and not parts.query:
            slug = parts.path[len(prefix):].strip("/")
            obj = apps.get_model(app, model).objects.filter(slug=slug).first()
            if obj is not None:
                return {"link_type": field, field: obj.pk}
    return {"link_type": "legacy", "url": text}


def to_text(apps, link):
    kind = link.get("link_type")
    if kind == "page":
        return PAGES.get(link.get("page"), "")
    if kind in ("url", "legacy"):
        return link.get("url") or ""
    if kind == "search":
        params = []
        for name in SEARCH_PARAMS:
            value = (link.get("search") or {}).get(name)
            if name == "topic" and value:
                topic = apps.get_model("pages", "Topic").objects.filter(pk=value).first()
                value = topic.slug if topic else None
            if value:
                params.append((name, value))
        return "/search" + (f"?{urlencode(params)}" if params else "")
    for prefix, (field, app, model) in CHOOSER_PREFIXES.items():
        if kind == field and link.get(field):
            obj = apps.get_model(app, model).objects.filter(pk=link[field]).first()
            return f"{prefix}{obj.slug}" if obj else ""
    return ""


def walk(node, convert):
    """Convert every link field found anywhere in a stream's raw JSON."""
    if isinstance(node, list):
        return [walk(item, convert) for item in node]
    if isinstance(node, dict):
        return {key: (convert(value) if key in LINK_KEYS else walk(value, convert)) for key, value in node.items()}
    return node


def _convert_page(apps, convert):
    GeLearnIndexPage = apps.get_model("pages", "GeLearnIndexPage")
    Revision = apps.get_model("wagtailcore", "Revision")
    ContentType = apps.get_model("contenttypes", "ContentType")
    content_type = ContentType.objects.filter(app_label="pages", model="gelearnindexpage").first()
    for page in GeLearnIndexPage.objects.all():
        for field in ("home_sections", "member_sections"):
            setattr(page, field, walk(list(getattr(page, field).raw_data), convert))
        page.save(update_fields=["home_sections", "member_sections"])
        if content_type is None:
            continue
        for rev in Revision.objects.filter(content_type=content_type, object_id=str(page.pk)):
            content = dict(rev.content)
            changed = False
            for field in ("home_sections", "member_sections"):
                stream = content.get(field)
                if isinstance(stream, str) and stream:
                    content[field] = json.dumps(walk(json.loads(stream), convert))
                    changed = True
            if changed:
                rev.content = content
                rev.save(update_fields=["content"])


def forwards(apps, schema_editor):
    _convert_page(apps, lambda value: to_link(apps, value) if isinstance(value, str) else value)


def backwards(apps, schema_editor):
    _convert_page(apps, lambda value: to_text(apps, value) if isinstance(value, dict) else value)


class Migration(migrations.Migration):

    dependencies = [
        ("pages", "0042_gelearn_link_picker"),
        ("learning", "0003_seed_career_roles"),
        ("organizations", "0002_expert_wording"),
        ("wagtailcore", "0094_alter_page_locale"),
    ]

    operations = [migrations.RunPython(forwards, backwards)]
