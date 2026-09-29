import datetime
from decimal import Decimal

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from accounts.models import User
from organizations.models import Company
from pages.models import CaseStudy, PodcastEpisode, TechArticle, Tender, Whitepaper

TODAY = "2026-09-29"


def make_user(username, **kwargs):
    return User.objects.create_user(username=username, email=f"{username}@example.org", password="Passw0rd!x", **kwargs)


class StudioTestBase(TestCase):
    def setUp(self):
        self.api = APIClient()
        self.genex = Company.objects.create(name="Genex", slug="genex")
        self.other = Company.objects.create(name="Other Co", slug="other-co")
        self.staff = make_user("staff", account_type="company", company=self.genex)
        self.staff2 = make_user("staff2", account_type="company", company=self.genex)
        self.rival = make_user("rival", account_type="company", company=self.other)
        self.pro = make_user("pro", account_type="professional", company_other="Acme", role_title="Engineer", display_name="Priya Rao")
        self.learner = make_user("learner")
        self.admin = User.objects.create_superuser("root", "root@example.org", "Passw0rd!x")


class StudioPermissionTests(StudioTestBase):
    def test_only_company_staff_and_admin_can_use_the_studio(self):
        for user, expected in ((None, 401), (self.learner, 403), (self.pro, 403)):
            if user:
                self.api.force_authenticate(user)
            self.assertEqual(self.api.get("/api/studio/policies-tenders/").status_code, expected, user)
        self.api.force_authenticate(self.staff)
        self.assertEqual(self.api.get("/api/studio/policies-tenders/").status_code, 200)

    def test_create_sets_owner_and_company_server_side(self):
        self.api.force_authenticate(self.staff)
        res = self.api.post("/api/studio/policies-tenders/", {
            "title": "Grid policy", "authority": "CEA", "deadline": "30/06/2026", "value": "—",
            "status": "Open", "sector": "Grid", "description": "d",
        }, format="json")
        self.assertEqual(res.status_code, 201, res.content)
        tender = Tender.objects.get()
        self.assertEqual((tender.owner, tender.company), (self.staff, self.genex))

    def test_company_scoping(self):
        mine = Tender.objects.create(title="Mine", authority="a", deadline="d", value="v", sector="s", description="d", company=self.genex)
        theirs = Tender.objects.create(title="Theirs", authority="a", deadline="d", value="v", sector="s", description="d", company=self.other)

        self.api.force_authenticate(self.staff2)  # a colleague, not the creator
        titles = [row["title"] for row in self.api.get("/api/studio/policies-tenders/").json()["results"]]
        self.assertEqual(titles, ["Mine"])
        self.assertEqual(self.api.patch(f"/api/studio/policies-tenders/{mine.pk}/", {"title": "Edited"}, format="json").status_code, 200)
        self.assertEqual(self.api.patch(f"/api/studio/policies-tenders/{theirs.pk}/", {"title": "x"}, format="json").status_code, 404)
        self.assertEqual(self.api.delete(f"/api/studio/policies-tenders/{theirs.pk}/").status_code, 404)

        self.api.force_authenticate(self.admin)
        self.assertEqual(len(self.api.get("/api/studio/policies-tenders/").json()["results"]), 2)
        self.assertEqual(self.api.delete(f"/api/studio/policies-tenders/{theirs.pk}/").status_code, 204)
        res = self.api.post("/api/studio/policies-tenders/", {"title": "x"}, format="json")
        self.assertIn(res.status_code, (400, 403))

    def test_company_cannot_forge_publisher_or_featured(self):
        self.api.force_authenticate(self.staff)
        res = self.api.post("/api/studio/research/", {
            "title": "R", "category": "Solar", "category_color": "bg-primary", "excerpt": "e", "date": TODAY,
            "read_time": "4 min", "company": self.other.pk, "owner": self.rival.pk, "featured": True,
        }, format="json")
        self.assertEqual(res.status_code, 201, res.content)
        item = CaseStudy.objects.get()
        self.assertEqual((item.company, item.owner, item.featured), (self.genex, self.staff, False))


class StudioContentTests(StudioTestBase):
    def setUp(self):
        super().setUp()
        self.api.force_authenticate(self.staff)

    def test_geacademy_rich_text_is_sanitised_and_round_trips(self):
        res = self.api.post("/api/studio/geacademy/", {
            "title": "IEC 61850", "topic": "Protocols", "difficulty": "Advanced", "read_time": "8 min",
            "date": TODAY, "excerpt": "e",
            "intro": '<p onclick="steal()">Intro <script>alert(1)</script><a href="javascript:x()">bad</a></p>',
            "sections": [{"heading": "GOOSE", "body": "<p><b>Fast</b> <img src=x onerror=alert(1)></p>"}],
            "tags": ["IEC", " SCADA "], "takeaways": ["One", "  "],
            "callout_label": "Key", "callout_content": "c",
        }, format="json")
        self.assertEqual(res.status_code, 201, res.content)
        body = res.json()
        blob = str(body)
        for bad in ("script", "onclick", "javascript:", "onerror", "<img"):
            self.assertNotIn(bad, blob)
        self.assertEqual(body["sections"][0]["heading"], "GOOSE")
        self.assertIn("<b>Fast</b>", body["sections"][0]["body"])
        self.assertEqual(sorted(body["tags"]), ["IEC", "SCADA"])
        self.assertEqual(body["takeaways"], ["One"])

        public = APIClient().get(f"/api/snippets/tech-articles/{body['id']}/").json()
        self.assertEqual(public["company"], {"name": "Genex", "slug": "genex", "logo_url": None, "verified": True})
        self.assertEqual(len(public["sections"]), 1)

    def test_research_color_must_be_a_design_token(self):
        res = self.api.post("/api/studio/research/", {
            "title": "R", "category": "Solar", "category_color": "bg-[url(evil)]", "excerpt": "e",
            "date": TODAY, "read_time": "4 min",
        }, format="json")
        self.assertEqual(res.status_code, 400)
        self.assertIn("category_color", res.json())

    def test_whitepaper_palette_maps_to_colours(self):
        res = self.api.post("/api/studio/whitepapers/", {
            "title": "W", "category": "Grid", "palette": "emerald", "date": TODAY, "pages": "12 pages", "description": "d",
        }, format="json")
        self.assertEqual(res.status_code, 201, res.content)
        paper = Whitepaper.objects.get()
        self.assertEqual((paper.category_bg, paper.category_text), ("#ecfdf5", "#047857"))
        self.assertEqual(res.json()["palette"], "emerald")

    def test_whitepaper_document_must_be_pdf(self):
        paper = Whitepaper.objects.create(title="W", category="c", category_bg="#fff", category_text="#000",
                                          date=datetime.date.today(), pages="1", description="d", company=self.genex)
        bad = SimpleUploadedFile("notes.exe", b"MZ", content_type="application/octet-stream")
        res = self.api.post(f"/api/studio/whitepapers/{paper.pk}/document/", {"file": bad}, format="multipart")
        self.assertEqual(res.status_code, 400)
        pdf = SimpleUploadedFile("paper.pdf", b"%PDF-1.4\n%%EOF", content_type="application/pdf")
        res = self.api.post(f"/api/studio/whitepapers/{paper.pk}/document/", {"file": pdf}, format="multipart")
        self.assertEqual(res.status_code, 200, res.content)
        self.assertTrue(res.json()["document_url"])

    def test_svg_upload_refused_for_non_admin(self):
        item = TechArticle.objects.create(title="t", topic="t", read_time="1", date=datetime.date.today(), excerpt="e", company=self.genex)
        svg = SimpleUploadedFile("x.svg", b'<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>', content_type="image/svg+xml")
        res = self.api.post(f"/api/studio/geacademy/{item.pk}/image/", {"file": svg}, format="multipart")
        self.assertEqual(res.status_code, 400)
        self.assertIn("SVG", res.json()["detail"])

    def test_podcast_collaborators_are_professionals_by_username(self):
        payload = {
            "title": "Ep 1", "category": "Grid", "date": TODAY, "duration": "40 min", "description": "d",
            "guest": "Priya Rao", "guest_role": "Engineer", "access": "paid", "price": "199",
        }
        res = self.api.post("/api/studio/podcasts/", {**payload, "collaborators": ["learner"]}, format="json")
        self.assertEqual(res.status_code, 400)  # learners can't be collaborators

        res = self.api.post("/api/studio/podcasts/", {**payload, "collaborators": ["pro"]}, format="json")
        self.assertEqual(res.status_code, 201, res.content)
        self.assertEqual([c["username"] for c in res.json()["collaborators"]], ["pro"])
        episode = PodcastEpisode.objects.get()
        self.assertEqual(episode.price, Decimal("199"))

        # Shows on the professional's profile; paid content opens for collaborator and company staff.
        self.assertEqual(APIClient().get("/api/accounts/users/pro/podcast-appearances/").json()["count"], 1)
        for user, locked in ((self.pro, False), (self.staff2, False), (self.learner, True)):
            client = APIClient()
            client.force_authenticate(user)
            self.assertEqual(client.get(f"/api/snippets/podcasts/{episode.pk}/").json()["is_locked"], locked, user)

    def test_paid_podcast_needs_price_and_free_clears_it(self):
        base = {"title": "E", "category": "c", "date": TODAY, "duration": "1", "description": "d", "guest": "g", "guest_role": "r"}
        self.assertIn("price", self.api.post("/api/studio/podcasts/", {**base, "access": "paid"}, format="json").json())
        res = self.api.post("/api/studio/podcasts/", {**base, "access": "free", "price": "50"}, format="json")
        self.assertEqual(res.status_code, 201, res.content)
        self.assertIsNone(res.json()["price"])


class StudioCompanyEndpointsTests(StudioTestBase):
    def test_company_and_team(self):
        make_user("tutor", account_type="professional", company=self.genex, role_title="Eng")
        self.api.force_authenticate(self.staff)
        company = self.api.get("/api/studio/company/").json()
        self.assertEqual((company["slug"], company["counts"]["geacademy"]), ("genex", 0))
        team = self.api.get("/api/studio/team/").json()
        self.assertEqual(sorted(u["username"] for u in team["staff"]), ["staff", "staff2"])
        self.assertTrue(all(u["verified"] for u in team["staff"]))  # staff are verified by construction
        self.assertEqual([(u["username"], u["verified"]) for u in team["professionals"]], [("tutor", False)])  # not confirmed yet

        self.api.force_authenticate(self.pro)
        self.assertEqual(self.api.get("/api/studio/team/").status_code, 403)

    def test_professional_search(self):
        self.api.force_authenticate(self.staff)
        self.assertEqual(self.api.get("/api/studio/professionals/?q=p").json(), [])
        results = self.api.get("/api/studio/professionals/?q=priya").json()
        self.assertEqual([r["username"] for r in results], ["pro"])
        self.assertEqual(self.api.get("/api/studio/professionals/?q=learn").json(), [])  # learners excluded
