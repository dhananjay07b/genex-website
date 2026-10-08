import re
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

FRONTEND_CSS = Path(settings.BASE_DIR).parent / "frontend/src/pages/GeLearn/certificate/certificate.css"
PDF_CSS = Path(__file__).resolve().parents[2] / "certificate_assets/certificate.css"
MM_PER_CQW = 2.97  # the sheet is 297 mm wide: 1 cqw = 1% of it

HEADER = """/*
 * GENERATED from frontend/src/pages/GeLearn/certificate/certificate.css (cqw x 2.97 = mm on an
 * A4 landscape sheet) by learning/management/commands/sync_certificate_css.py. Edit the
 * frontend file, then run `manage.py sync_certificate_css`; PDF-only overrides live in
 * templates/learning/certificate_pdf.html.
 */
"""


def to_mm(match):
    mm = f"{float(match.group(1)) * MM_PER_CQW:.2f}".rstrip("0").rstrip(".")
    return f"{mm}mm"


class Command(BaseCommand):
    help = "Regenerate the PDF certificate stylesheet from the website's certificate.css, so both stay one design."

    def handle(self, *args, **options):
        if not FRONTEND_CSS.exists():
            raise CommandError(f"Not found: {FRONTEND_CSS}")
        css = FRONTEND_CSS.read_text()
        css = re.sub(r"@import[^\n]*\n", "", css)  # fonts are bundled for the PDF
        css = re.sub(r"(-?\d*\.?\d+)cqw", to_mm, css)
        PDF_CSS.write_text(HEADER + css.strip() + "\n")
        self.stdout.write(self.style.SUCCESS(f"Wrote {PDF_CSS}"))
