from django.core.management.base import BaseCommand, CommandError

from organizations.models import Company
from pages.models import CaseStudy, PodcastEpisode, TechArticle, Tender, Whitepaper

PUBLISHED_MODELS = (TechArticle, CaseStudy, Tender, Whitepaper, PodcastEpisode)


class Command(BaseCommand):
    help = (
        "Attribute existing GeAcademy / Research / Policies & Tenders / Whitepaper / Podcast "
        "items that have no publisher to a company (e.g. Genex), so they show its logo and "
        "become editable from that company's Studio."
    )

    def add_arguments(self, parser):
        parser.add_argument("company_slug", help="Slug of the company, e.g. genex-technocrats")
        parser.add_argument("--dry-run", action="store_true", help="Show counts without changing anything.")

    def handle(self, company_slug, dry_run=False, **options):
        company = Company.objects.filter(slug=company_slug).first()
        if company is None:
            raise CommandError(f"No company with slug '{company_slug}'. Create it in Django admin first.")
        for model in PUBLISHED_MODELS:
            unassigned = model.objects.filter(company__isnull=True)
            count = unassigned.count()
            if not dry_run:
                unassigned.update(company=company)
            verb = "would assign" if dry_run else "assigned"
            self.stdout.write(f"{model._meta.verbose_name_plural}: {verb} {count} to {company.name}")
