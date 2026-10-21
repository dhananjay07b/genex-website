"""
Helpers that build raw StreamField values for CONTENT_BODY_BLOCKS
(pages/models.py), one function per block, using the exact field names of
the blocks in pages/blocks.py.

Images and documents are always left empty: editors upload them in the CMS.
Each image slot carries an `image_hint` that the seed command prints as a
checklist; hints are stripped before anything is saved.

Links to other pages are written as placeholders (contact(), product(), innovation()) and
resolved to real page IDs by the seed command, so the content files never
hard-code database IDs.
"""
from html import escape

LINK_KEY = "__link__"
PAGE_KEY = "__page__"
HINT_KEY = "image_hint"


# ── Link placeholders ────────────────────────────────────────────────────────

def no_link():
    """An optional link left empty ("No link" in the CMS)."""
    return {"link_type": "none"}


def contact(section="demo"):
    """The Contact page, opened at a section ('demo' = Request a demo form)."""
    return {LINK_KEY: ("contact", section)}


def product(key):
    """A Portfolio page, by its key in seed_content.portfolio.PAGES."""
    return {LINK_KEY: ("page", ("portfolio", key))}


def innovation(key):
    """An Innovations page, by its key in seed_content.innovations.PAGES."""
    return {LINK_KEY: ("page", ("innovations", key))}


def _rich(paragraphs):
    if isinstance(paragraphs, str):
        paragraphs = [paragraphs]
    return "".join(f"<p>{escape(p)}</p>" for p in paragraphs)


def _block(block_type, value):
    return {"type": block_type, "value": value}


# ── Blocks ───────────────────────────────────────────────────────────────────

def hero(heading, description, label="", cta_text="", cta_link=None, image_hint=""):
    return _block("hero", {
        "label": label,
        "heading": heading,
        "description": description,
        "cta_text": cta_text,
        "cta_link": cta_link or no_link(),
        "background_image": None,
        HINT_KEY: image_hint,
    })


def intro(heading, paragraphs, note=""):
    return _block("intro", {"heading": heading, "description": _rich(paragraphs), "note": note})


def overview(heading, paragraphs):
    return _block("overview", {"heading": heading, "paragraphs": list(paragraphs)})


def stats(heading, items):
    """items: (value, suffix, label). Use 3 or 6, the grid has 3 columns."""
    return _block("stats", {
        "heading": heading,
        "stats": [{"value": v, "suffix": s, "label": l} for v, s, l in items],
    })


def cards(heading, description, items):
    """items: (icon, title, description, note). Use 3 or 6, the grid has 3 columns."""
    return _block("card_section", {
        "heading": heading,
        "description": description,
        "cards": [
            {"icon": i, "title": t, "description": d, "note": n, "link": no_link()}
            for i, t, d, n in items
        ],
    })


def capabilities(heading, items):
    """items: (icon, text). Use an even number, the list has 2 columns."""
    return _block("capabilities", {
        "heading": heading,
        "items": [{"icon": i, "text": t} for i, t in items],
    })


def highlights(eyebrow, intro_text, items):
    """items: (card_type, icon, heading, description, sub_text). Use 4 or 6.
    card_type: icon, ring_stat, diagram, security, signal, timeline.
    Never 'chat': it shows canned sample replies we cannot stand behind."""
    return _block("tech_highlights", {
        "eyebrow": eyebrow,
        "intro": intro_text,
        "items": [
            {"card_type": c, "icon": i, "heading": h, "description": d, "sub_text": s}
            for c, i, h, d, s in items
        ],
    })


def steps(heading, description, items):
    """items: (title, description, icon). Numbers 01, 02... are added in order."""
    return _block("deployment_steps", {
        "heading": heading,
        "description": description,
        "steps": [
            {"num": f"{n:02d}", "title": t, "description": d, "icon": i}
            for n, (t, d, i) in enumerate(items, start=1)
        ],
    })


def side(heading, description, position, alt, bullets=(), text="", image_hint=""):
    """Image beside text. bullets: (bold_title, point). `text` adds a closing paragraph."""
    body = [_block("bullet", {"bold_title": b, "point": p}) for b, p in bullets]
    if text:
        body.append(_block("text", text))
    return _block("side_section", {
        "heading": heading,
        "description": _rich(description),
        "image": {"image": None, "alt": alt, "position": position, HINT_KEY: image_hint},
        "body_blocks": body,
    })


def how_we_work(heading, description, items, principles=()):
    """items: (title, desc, image_hint). principles: (title, desc)."""
    return _block("how_we_work", {
        "heading": heading,
        "description": description,
        "steps": [
            {"num": f"{n:02d}", "title": t, "desc": d, "image": None, HINT_KEY: h}
            for n, (t, d, h) in enumerate(items, start=1)
        ],
        "principles": [{"title": t, "desc": d} for t, d in principles],
    })


def faq(heading, items):
    """items: (q, a) or (section, q, a)."""
    rows = []
    for item in items:
        section, q, a = item if len(item) == 3 else ("", *item)
        rows.append({"section": section, "q": q, "a": a})
    return _block("faq_section", {"heading": heading, "items": rows})


def related(heading, keys, description=""):
    """Portfolio cards for other products. Always give a description: an empty one
    used to leave a gap under the heading on older frontend builds."""
    return _block("portfolio_section", {
        "heading": heading,
        "description": description,
        "items": [{"page": {PAGE_KEY: ("portfolio", k)}} for k in keys],
    })


def related_innovations(heading, items, description):
    """Innovation cards for other Innovations pages. items: (key, icon)."""
    return _block("innovations_section", {
        "heading": heading,
        "description": description,
        "items": [{"page": {PAGE_KEY: ("innovations", k)}, "icon": i} for k, i in items],
    })


def gallery(items):
    """Image mosaic with a fixed "Gallery" heading. items: (alt, image_hint).
    Use exactly 4: the mosaic is built in blocks of four."""
    return _block("gallery", [{"image": None, "alt": a, HINT_KEY: h} for a, h in items])


def milestones(items):
    """Roadmap / timeline. items: (year, label, title, description, is_current).
    `year` is free text up to 10 characters, e.g. 'Live', 'Next', '2027'."""
    return _block("milestones", [
        {"year": y, "label": l, "title": t, "description": d, "is_current": c}
        for y, l, t, d, c in items
    ])


def cta(heading, description, primary_text, primary_link, secondary_text="", secondary_link=None):
    return _block("cta", {
        "heading": heading,
        "description": description,
        "primary_cta_text": primary_text,
        "primary_cta_link": primary_link or no_link(),
        "secondary_cta_text": secondary_text,
        "secondary_cta_link": secondary_link or no_link(),
    })
