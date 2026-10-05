from django.core.exceptions import ValidationError
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Company, CompanyDomain


class CompanyDomainTests(TestCase):
    def setUp(self):
        self.google = Company.objects.create(name="Google", slug="google")

    def test_domain_is_normalised(self):
        d = CompanyDomain(company=self.google, domain="  @Google.COM. ")
        d.full_clean()
        d.save()
        self.assertEqual(d.domain, "google.com")

    def test_public_mail_domain_rejected(self):
        with self.assertRaises(ValidationError):
            CompanyDomain(company=self.google, domain="gmail.com").full_clean()

    def test_malformed_domain_rejected(self):
        for bad in ("https://google.com", "google", "a@b.com", "go ogle.com"):
            with self.assertRaises(ValidationError, msg=bad):
                CompanyDomain(company=self.google, domain=bad).full_clean()

    def test_owns_email_matches_domain_and_subdomains_only(self):
        CompanyDomain.objects.create(company=self.google, domain="google.com")
        self.assertTrue(self.google.owns_email("a@google.com"))
        self.assertTrue(self.google.owns_email("a@IN.Google.com"))
        self.assertFalse(self.google.owns_email("a@notgoogle.com"))
        self.assertFalse(self.google.owns_email("a@google.com.evil.io"))
        self.assertFalse(self.google.owns_email(""))


class CompanyApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        google = Company.objects.create(name="Google", slug="google")
        CompanyDomain.objects.create(company=google, domain="google.com")
        Company.objects.create(name="Defunct", slug="defunct", is_active=False)

    def test_list_shows_only_active_companies_with_domains(self):
        res = self.client.get("/api/organizations/companies/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(
            res.json(),
            [{"id": res.json()[0]["id"], "name": "Google", "slug": "google", "logo_url": None, "domains": ["google.com"]}],
        )

    def test_detail_hides_inactive(self):
        self.assertEqual(self.client.get("/api/organizations/companies/google/").status_code, 200)
        self.assertEqual(self.client.get("/api/organizations/companies/defunct/").status_code, 404)


class CompanyPageTests(TestCase):
    def test_company_page_lists_content_experts_and_courses(self):
        import datetime

        from accounts.models import User
        from learning.models import Playlist
        from pages.models import TechArticle

        genex = Company.objects.create(name="Genex", slug="genex", description="Energy software.")
        TechArticle.objects.create(title="IEC 61850", read_time="5", date=datetime.date(2026, 9, 1), excerpt="e", company=genex)
        expert = User.objects.create_user("exp", "exp@genex.io", "Passw0rd!x", account_type="professional",
                                          company=genex, company_verified=True, role_title="Eng", display_name="Asha")
        User.objects.create_user("pending", "p@genex.io", "Passw0rd!x", account_type="professional", company=genex, role_title="Eng")
        Playlist.objects.create(owner=expert, title="Grid 101", status="published")
        Playlist.objects.create(owner=expert, title="Draft course")

        body = APIClient().get("/api/organizations/companies/genex/").json()
        self.assertEqual(body["description"], "Energy software.")
        self.assertEqual([(s["key"], s["count"]) for s in body["content"]], [("geacademy", 1)])
        self.assertEqual(body["content"][0]["items"][0]["path"].split("/")[1], "geacademy")
        self.assertEqual([e["username"] for e in body["experts"]], ["exp"])  # pending not listed
        self.assertEqual([c["title"] for c in body["courses"]], ["Grid 101"])
