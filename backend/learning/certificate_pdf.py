"""
The certificate as a file: an A4 landscape PDF (WeasyPrint) and a PNG picture of
it (rendered from the PDF with PyMuPDF), for LinkedIn's link preview. Both come
from templates/learning/certificate_pdf.html, whose stylesheet is generated from
the website's certificate.css (manage.py sync_certificate_css), so the website,
the PDF and the picture are one design.
"""
from pathlib import Path
from urllib.parse import urlsplit

import segno
from django.conf import settings
from django.template.loader import render_to_string

ASSETS = Path(__file__).resolve().parent / "certificate_assets"
LEVELS = {"beginner": "Beginner", "intermediate": "Intermediate", "advanced": "Advanced"}


def certificate_url(code):
    return f"{settings.GELEARN_FRONTEND_URL.rstrip('/')}/certificates/{code}"


def _initials(name):
    return "".join(word[0] for word in name.split()[:2]).upper() or "?"


def _file_uri(media_url):
    """A media URL (/media/…) as a local file the PDF engine can read; None if it's missing."""
    if not media_url:
        return None
    path = urlsplit(media_url).path
    if not path.startswith(settings.MEDIA_URL):
        return None
    local = Path(settings.MEDIA_ROOT) / path[len(settings.MEDIA_URL):]
    return local.as_uri() if local.exists() else None


def _minutes(minutes):
    if not minutes:
        return ""
    if minutes < 60:
        return f"About {minutes} min"
    hours = round(minutes / 30) / 2
    return f"About {hours:g} hour{'' if hours == 1 else 's'}"


def _company(company):
    return company and {**company, "logo": _file_uri(company.get("logo_url")), "initials": _initials(company["name"])}


def render_html(certificate):
    snap = certificate.snapshot
    course = snap["course"]
    instructors = [{**p, "company": _company(p.get("company"))} for p in snap.get("instructors", [])]
    lessons = course.get("lessons") or 0
    meta = [
        LEVELS.get(course.get("level") or "", ""),
        f"{lessons} lesson{'' if lessons == 1 else 's'}" if lessons else "",
        _minutes(course.get("minutes") or 0),
        f"Completed {certificate.issued_at:%-d %B %Y}",
    ]
    url = certificate_url(certificate.code)
    return render_to_string("learning/certificate_pdf.html", {
        "code": certificate.code,
        "learner_name": certificate.learner_name,
        "course": course,
        "meta": [m for m in meta if m],
        "instructors": instructors,
        "people_count": max(len(instructors), 1),
        "lead": instructors[0] | {"initials": _initials(instructors[0]["name"])} if instructors else None,
        "publisher": _company(snap.get("publisher")),
        "qr": segno.make(url, error="m").svg_inline(border=0, dark="#0F172B", omitsize=True),
        "printed_url": f"{urlsplit(url).netloc}{urlsplit(url).path}",
        "css": (ASSETS / "certificate.css").read_text(),
        "fonts": (ASSETS / "fonts").as_uri(),
        "seal": (ASSETS / "seal.png").as_uri(),
        "background": (ASSETS / "background.svg").as_uri(),
        "logo": (ASSETS / "gelearn-logo.svg").as_uri(),
    })


def render_pdf(certificate):
    from weasyprint import HTML  # imported lazily: it loads native libraries (Pango)
    return HTML(string=render_html(certificate), base_url=str(ASSETS)).write_pdf()


def render_png(certificate, width=1200):
    """The certificate as a picture, `width` pixels wide (LinkedIn previews use 1200 x 627)."""
    import pymupdf
    pdf = pymupdf.open(stream=render_pdf(certificate), filetype="pdf")
    page = pdf[0]
    zoom = width / page.rect.width
    return page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), alpha=False).tobytes("png")
