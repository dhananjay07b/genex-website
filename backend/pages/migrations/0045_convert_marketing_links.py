"""
Turns the marketing site's typed links into picker choices (pages/links.py
LinkBlock with site="marketing"), on every page and every saved revision.

It walks each StreamField using the block definitions frozen in this migration
state, so only fields that are now LinkBlocks are touched; genuine outside
addresses in other fields (e.g. tech partner sites) are left alone.

  /contact#demo     → Genex page "Contact" + jump to "Request a demo form"
  /portfolio        → Genex page "Portfolio"
  #form             → this same page + jump to "Contact form"
  https://…         → Web address
  anything else     → "Old typed address", kept as typed (e.g. a Portfolio page
                      that hasn't been re-entered yet). Re-pick it once the page exists.

Reversible: picker choices become the same addresses again.
"""
import json

from django.db import migrations
from wagtail import blocks as wagtail_blocks

SECTIONS = {"demo", "form", "apply"}  # frozen copy of pages.links.PAGE_SECTIONS keys


def _page_for_path(Page, path):
    path = path.rstrip("/")
    if path in ("", "/"):
        return Page.objects.filter(depth=2, slug="home").first()
    return Page.objects.filter(url_path=f"{path}/").first()


def _path_for_page(Page, page_id):
    page = Page.objects.filter(pk=page_id).first()
    if page is None:
        return ""
    if page.depth == 2 and page.slug == "home":
        return "/"
    return page.url_path.rstrip("/")


def to_link(Page, text, own_page_id):
    text = (text or "").strip()
    if not text:
        return {"link_type": "none"}
    if text.startswith(("http://", "https://")):
        return {"link_type": "url", "url": text}
    path, _, anchor = text.partition("#")
    if anchor and anchor not in SECTIONS:
        return {"link_type": "legacy", "url": text}
    page_id = own_page_id if not path else getattr(_page_for_path(Page, path), "pk", None)
    if page_id is None:
        return {"link_type": "legacy", "url": text}
    link = {"link_type": "genex_page", "genex_page": page_id}
    if anchor:
        link["section"] = anchor
    return link


def to_text(Page, link):
    kind = link.get("link_type")
    if kind in ("url", "legacy"):
        return link.get("url") or ""
    if kind == "genex_page" and link.get("genex_page"):
        path = _path_for_page(Page, link["genex_page"])
        return f"{path}#{link['section']}" if link.get("section") else path
    return ""


def _is_link_block(block):
    # Migration state rebuilds LinkBlock as a plain StructBlock (keeping its options), so recognise it by shape.
    return isinstance(block, wagtail_blocks.StructBlock) and {"link_type", "genex_page"} <= set(block.child_blocks)


def walk(block, raw, convert):
    """Convert link values in `raw` wherever `block`'s definition says the value is a LinkBlock."""
    if _is_link_block(block):
        # Only the marketing site's links; GeLearn's were converted by 0043.
        return convert(raw) if getattr(block.meta, "site", "gelearn") == "marketing" else raw
    if isinstance(block, wagtail_blocks.StreamBlock) and isinstance(raw, list):
        for item in raw:
            child = block.child_blocks.get(item.get("type"))
            if child is not None:
                item["value"] = walk(child, item.get("value"), convert)
        return raw
    if isinstance(block, wagtail_blocks.ListBlock) and isinstance(raw, list):
        out = []
        for item in raw:
            if isinstance(item, dict) and item.get("type") == "item" and "value" in item:
                item["value"] = walk(block.child_block, item["value"], convert)
                out.append(item)
            else:
                out.append(walk(block.child_block, item, convert))
        return out
    if isinstance(block, wagtail_blocks.StructBlock) and isinstance(raw, dict):
        for name, child in block.child_blocks.items():
            if name in raw:
                raw[name] = walk(child, raw[name], convert)
        return raw
    return raw


def _stream_fields(model):
    return [f for f in model._meta.get_fields() if getattr(f, "stream_block", None) is not None]


def _run(apps, make_converter):
    Page = apps.get_model("wagtailcore", "Page")
    Revision = apps.get_model("wagtailcore", "Revision")
    ContentType = apps.get_model("contenttypes", "ContentType")
    for model in apps.get_app_config("pages").get_models():
        fields = _stream_fields(model)
        if not fields or not any(f.name == "page_ptr" for f in model._meta.get_fields()):
            continue
        content_type = ContentType.objects.filter(app_label="pages", model=model._meta.model_name).first()
        for page in model.objects.all():
            convert = make_converter(Page, page.pk)
            for field in fields:
                raw = json.loads(json.dumps(list(getattr(page, field.name).raw_data)))
                setattr(page, field.name, walk(field.stream_block, raw, convert))
            page.save(update_fields=[f.name for f in fields])
            if content_type is None:
                continue
            for rev in Revision.objects.filter(content_type=content_type, object_id=str(page.pk)):
                content, changed = dict(rev.content), False
                for field in fields:
                    stream = content.get(field.name)
                    if isinstance(stream, str) and stream:
                        content[field.name] = json.dumps(walk(field.stream_block, json.loads(stream), convert))
                        changed = True
                if changed:
                    rev.content = content
                    rev.save(update_fields=["content"])


def forwards(apps, schema_editor):
    _run(apps, lambda Page, pk: (lambda v: to_link(Page, v, pk) if isinstance(v, str) else v))


def backwards(apps, schema_editor):
    _run(apps, lambda Page, pk: (lambda v: to_text(Page, v) if isinstance(v, dict) else v))


class Migration(migrations.Migration):

    dependencies = [("pages", "0044_marketing_link_picker")]

    operations = [migrations.RunPython(forwards, backwards)]
