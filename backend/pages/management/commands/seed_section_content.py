"""
Writes the text and icons of a section's pages (Portfolio, Innovations) from
pages/seed_content/<section>/ into the CMS.

Safe by default:
  - Without --apply nothing is written; the command checks every block and
    prints what it would do.
  - With --apply each page gets a new DRAFT revision. The live page does not
    change until an editor adds the images and presses Publish.
  - Pages that already have unpublished changes are skipped unless --force.
  - Only pages listed in the section's CONTENT are touched; pages written by
    hand in the CMS are never changed.

Images are left empty; the command prints which image each block needs.

  python manage.py seed_section_content innovations --list
  python manage.py seed_section_content innovations                 # check only
  python manage.py seed_section_content innovations --apply
  python manage.py seed_section_content innovations --apply --only re-nms
"""
import copy
from importlib import import_module

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from wagtail import blocks
from wagtail.documents.blocks import DocumentChooserBlock
from wagtail.images.blocks import ImageChooserBlock

from pages.models import ContactPage, ContentPage, SectionPage
from pages.seed_content.builders import HINT_KEY, LINK_KEY, PAGE_KEY

MEDIA_BLOCKS = (ImageChooserBlock, DocumentChooserBlock)
SECTIONS = ("portfolio", "innovations")


def load_section(section):
    """(PAGES, CONTENT) of seed_content.<section>. PAGES: key -> (slugs, titles)."""
    module = import_module(f"pages.seed_content.{section}")
    return module.PAGES, module.CONTENT


class Command(BaseCommand):
    help = "Write a section's page text and icons into the CMS as draft revisions."
    section = None  # set by subclasses that are fixed to one section

    def add_arguments(self, parser):
        if self.section is None:
            parser.add_argument("section", choices=SECTIONS, help="Which section's pages to write.")
        parser.add_argument("--apply", action="store_true", help="Write draft revisions. Without it, only check.")
        parser.add_argument("--only", nargs="+", metavar="KEY", help="Only these pages (keys from --list).")
        parser.add_argument("--list", action="store_true", help="Show the section's pages and how they match.")
        parser.add_argument("--create-missing", action="store_true",
                            help="Create a draft page for pages not found in the section.")
        parser.add_argument("--force", action="store_true",
                            help="Also write pages that already have unpublished changes.")

    def handle(self, *args, **opts):
        section = self.section or opts["section"]
        pages, content = load_section(section)

        parents, found = {}, {}
        for name in SECTIONS:
            parent = SectionPage.objects.filter(slug=name).first()
            parents[name] = parent
            found[name] = self._match_pages(parent, load_section(name)[0]) if parent else {}
        parent = parents[section]
        if not parent:
            raise CommandError(f"No Section Page with slug '{section}' found.")

        if opts["list"]:
            return self._print_list(section, parent, pages, content, found[section])

        keys = opts["only"] or list(content)
        unknown = [k for k in keys if k not in content]
        if unknown:
            raise CommandError(f"No seed content for: {', '.join(unknown)}. Choose from: {', '.join(content)}")

        contact_page = ContactPage.objects.live().first()
        if not contact_page:
            raise CommandError("No live Contact page found; CTA buttons need one to link to.")

        if opts["apply"] and opts["create_missing"]:
            # Create empty draft pages up front so pages created in this run can link to each other.
            for key in keys:
                if key not in found[section]:
                    found[section][key] = self._create(parent, pages[key])
                    self.stdout.write(f"Created draft page /{section}/{found[section][key].slug}")

        stream_block = ContentPage.body.field.stream_block
        tags_block = ContentPage.tags.field.stream_block
        errors, plans = [], []
        for key in keys:
            spec = content[key]
            body = self._resolve(copy.deepcopy(spec["body"]), found, contact_page, key)
            hints = []
            body = _strip_hints(body, hints)
            _check(stream_block, body, key, errors)
            plans.append((key, spec, body, hints))

        if errors:
            self.stderr.write(self.style.ERROR("Content does not match the CMS blocks:"))
            for e in errors:
                self.stderr.write(f"  - {e}")
            raise CommandError(f"{len(errors)} problem(s) found, nothing written.")

        mode = "WRITING DRAFTS" if opts["apply"] else "CHECK ONLY (add --apply to write)"
        self.stdout.write(self.style.MIGRATE_HEADING(f"\n{mode}\n"))

        written = 0
        for key, spec, body, hints in plans:
            page = found[section].get(key)
            label = page.title if page else pages[key][1][0]

            if page and page.has_unpublished_changes and not opts["force"]:
                self.stdout.write(self.style.WARNING(
                    f"SKIP  {label}: has unpublished changes in the CMS (use --force to overwrite the draft)"))
                continue
            if not page and not opts["create_missing"]:
                self.stdout.write(self.style.WARNING(
                    f"SKIP  {label}: not found under {parent.title} (use --create-missing to create it as a draft)"))
                continue

            action = f"update /{section}/{page.slug}" if page else f"create /{section}/{pages[key][0][0]}"
            self.stdout.write(self.style.SUCCESS(f"{'OK   ' if opts['apply'] else 'READY'} {label}: {action}"))
            self.stdout.write(f"      {len(body)} blocks: {' > '.join(b['type'] for b in body)}")

            if opts["apply"]:
                with transaction.atomic():
                    self._write(page, spec, body, stream_block, tags_block)
                written += 1

            for hint in hints:
                self.stdout.write(f"      image needed: {hint}")
            for item in spec.get("confirm", []):
                self.stdout.write(f"      confirm: {item}")
            self.stdout.write("")

        if opts["apply"]:
            self.stdout.write(self.style.SUCCESS(
                f"{written} draft(s) saved. Open each page in the CMS, add the images, review, then Publish."))

    # ── Finding pages ────────────────────────────────────────────────────────

    def _match_pages(self, parent, pages):
        children = list(ContentPage.objects.child_of(parent))
        found = {}
        for key, (slugs, titles) in pages.items():
            page = next((p for slug in slugs for p in children if p.slug == slug), None)
            if not page:
                wanted = {t.casefold() for t in titles}
                page = next((p for p in children if p.title.strip().casefold() in wanted), None)
            if page:
                found[key] = page
        return found

    def _print_list(self, section, parent, pages, content, found):
        by_id = {p.id: k for k, p in found.items()}
        self.stdout.write(self.style.MIGRATE_HEADING(f"Pages under {parent.title}:"))
        for page in ContentPage.objects.child_of(parent):
            key = by_id.get(page.id)
            status = "live" if page.live else "draft"
            if page.has_unpublished_changes:
                status += ", unpublished changes"
            if key in content:
                role = f"seeded as '{key}'"
            elif key:
                role = f"'{key}', hand-written, never changed"
            else:
                role = "not a known page, never changed"
            self.stdout.write(f"  /{section}/{page.slug:<28} {page.title:<34} [{status}] {role}")
        missing = [k for k in content if k not in found]
        if missing:
            self.stdout.write(self.style.WARNING(f"Not found (would need --create-missing): {', '.join(missing)}"))

    def _create(self, parent, page_info):
        slugs, titles = page_info
        page = ContentPage(title=titles[0], slug=slugs[0], live=False)
        parent.add_child(instance=page)
        return ContentPage.objects.get(pk=page.pk)

    # ── Building values ──────────────────────────────────────────────────────

    def _target(self, found, ref, key, what):
        target_section, target_key = ref
        target = found.get(target_section, {}).get(target_key)
        if not target:
            self.stdout.write(self.style.WARNING(f"  {key}: {what} '{target_section}/{target_key}' skipped, page not found"))
        return target

    def _resolve(self, value, found, contact_page, key):
        """Replace link and page placeholders with real page IDs."""
        if isinstance(value, list):
            out = []
            for item in value:
                resolved = self._resolve(item, found, contact_page, key)
                if resolved is not _DROP:
                    out.append(resolved)
            return out
        if isinstance(value, dict):
            if LINK_KEY in value:
                kind, arg = value[LINK_KEY]
                if kind == "contact":
                    return {"link_type": "genex_page", "genex_page": contact_page.id, "section": arg}
                target = self._target(found, arg, key, "link to")
                return {"link_type": "genex_page", "genex_page": target.id} if target else {"link_type": "none"}
            if isinstance(value.get("page"), dict) and PAGE_KEY in value["page"]:
                target = self._target(found, value["page"][PAGE_KEY], key, "related card")
                if not target:
                    return _DROP
                return {**value, "page": target.id}
            return {k: self._resolve(v, found, contact_page, key) for k, v in value.items()}
        return value

    def _write(self, page, spec, body, stream_block, tags_block):
        page.body = stream_block.to_python(body)
        page.tags = tags_block.to_python([{"type": "tag", "value": t} for t in spec.get("tags", [])])
        page.seo_title = spec.get("seo_title", "")
        page.search_description = spec.get("search_description", "")
        page.hide_footer_cta = spec.get("hide_footer_cta", False)
        page.save_revision(log_action=True)


_DROP = object()


def _strip_hints(value, hints):
    """Remove image_hint keys (they are not CMS fields) and collect them for the checklist."""
    if isinstance(value, list):
        return [_strip_hints(v, hints) for v in value]
    if isinstance(value, dict):
        if value.get(HINT_KEY):
            hints.append(value[HINT_KEY])
        return {k: _strip_hints(v, hints) for k, v in value.items() if k != HINT_KEY}
    return value


def _check(block, value, path, errors):
    """Walk a raw value against the block definition: unknown fields, invalid
    choices (icons, card styles), missing required text and over-long text.
    Image and document fields are skipped; editors fill those in the CMS."""
    if isinstance(block, MEDIA_BLOCKS):
        return
    if isinstance(block, blocks.StreamBlock):
        for i, child in enumerate(value or []):
            child_block = block.child_blocks.get(child.get("type"))
            if child_block is None:
                errors.append(f"{path}[{i}]: unknown block '{child.get('type')}'")
                continue
            _check(child_block, child.get("value"), f"{path}[{i}].{child['type']}", errors)
        return
    if isinstance(block, blocks.ListBlock):
        for i, item in enumerate(value or []):
            _check(block.child_block, item, f"{path}[{i}]", errors)
        return
    if isinstance(block, blocks.StructBlock):
        if not isinstance(value, dict):
            errors.append(f"{path}: expected fields, got {type(value).__name__}")
            return
        for name in value:
            if name not in block.child_blocks:
                errors.append(f"{path}: unknown field '{name}'")
        for name, child in block.child_blocks.items():
            child_value = value.get(name)
            if child_value in (None, "", []) and _required(child) and not isinstance(child, MEDIA_BLOCKS):
                if name in value or not _has_default(child):
                    errors.append(f"{path}.{name}: required")
                continue
            if name in value:
                _check(child, child_value, f"{path}.{name}", errors)
        return
    if isinstance(block, blocks.ChoiceBlock):
        valid = {str(c[0]) for c in block.field.choices if c[0] != ""}
        if value not in (None, "") and str(value) not in valid:
            errors.append(f"{path}: '{value}' is not an option in the CMS")
        return
    if isinstance(block, (blocks.CharBlock, blocks.TextBlock)):
        max_length = getattr(block.field, "max_length", None)
        if max_length and value and len(value) > max_length:
            errors.append(f"{path}: longer than {max_length} characters")


def _required(block):
    return getattr(block, "required", False)


def _has_default(block):
    return block.get_default() not in (None, "", [])
