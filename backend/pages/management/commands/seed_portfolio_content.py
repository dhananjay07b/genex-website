"""
Shortcut for `seed_section_content portfolio`; see seed_section_content.py.

  python manage.py seed_portfolio_content --list
  python manage.py seed_portfolio_content --apply
"""
from .seed_section_content import Command as SectionCommand


class Command(SectionCommand):
    help = "Write Portfolio page text and icons into the CMS as draft revisions."
    section = "portfolio"
