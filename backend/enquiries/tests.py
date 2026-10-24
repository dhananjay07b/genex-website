from unittest import mock

from django.core import mail
from django.core.cache import cache
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from .models import Enquiry

URL = "/api/enquiries/"
VALID = {
    "name": "Asha Rao", "company": "Sunfield Energy", "email": "asha@sunfield.example", "phone": "+91 98765 43210",
    "project_type": "Product demo", "message": "We'd like a SCADA demo for our 40 MW plant.",
}


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend", ENQUIRY_EMAIL="info@genex.example")
class EnquiryTests(TestCase):
    def setUp(self):
        cache.clear()  # throttle counts

    def test_enquiry_is_saved_and_emailed(self):
        res = APIClient().post(URL, {**VALID, "subject": "Application: Solar Engineer"}, format="json")
        self.assertEqual(res.status_code, 201)
        enquiry = Enquiry.objects.get()
        self.assertEqual((enquiry.company, enquiry.subject, enquiry.status, enquiry.email_sent), ("Sunfield Energy", "Application: Solar Engineer", "new", True))
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ["info@genex.example"])
        self.assertIn("Application: Solar Engineer", mail.outbox[0].subject)
        self.assertIn("40 MW plant", mail.outbox[0].body)

    def test_invalid_input_is_refused(self):
        res = APIClient().post(URL, {**VALID, "email": "nope", "phone": "abc", "message": "short"}, format="json")
        self.assertEqual(res.status_code, 400)
        self.assertEqual(set(res.json()), {"email", "phone", "message"})
        self.assertFalse(Enquiry.objects.exists())

    def test_company_optional_only_for_job_applications(self):
        no_company = {**VALID, "company": ""}
        self.assertEqual(APIClient().post(URL, no_company, format="json").status_code, 400)
        res = APIClient().post(URL, {**no_company, "subject": "Application: Solar Engineer"}, format="json")
        self.assertEqual(res.status_code, 201)

    def test_bots_filling_the_hidden_field_are_ignored(self):
        res = APIClient().post(URL, {**VALID, "website": "http://spam.example"}, format="json")
        self.assertEqual(res.status_code, 201)
        self.assertFalse(Enquiry.objects.exists())
        self.assertEqual(len(mail.outbox), 0)

    def test_email_failure_keeps_the_enquiry(self):
        with mock.patch("enquiries.views.send_mail", side_effect=OSError("SMTP down")):
            res = APIClient().post(URL, VALID, format="json")
        self.assertEqual(res.status_code, 201)
        self.assertFalse(Enquiry.objects.get().email_sent)

    def test_rate_limited(self):
        codes = [APIClient().post(URL, VALID, format="json").status_code for _ in range(11)]
        self.assertEqual(codes[-1], 429)
        self.assertEqual(Enquiry.objects.count(), 10)


import shutil
import tempfile

from django.core.files.uploadedfile import SimpleUploadedFile

PDF = b"%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF"
APPLY_URL = "/api/enquiries/applications/"


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend", ENQUIRY_EMAIL="info@genex.example")
class JobApplicationTests(TestCase):
    """The Apply form on job pages: saved with a private CV, reviewed in Django admin."""

    def setUp(self):
        from wagtail.models import Page
        from pages.models import CareersPage, JobPage
        cache.clear()
        self.private_root = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, self.private_root, ignore_errors=True)
        overrider = override_settings(PRIVATE_MEDIA_ROOT=self.private_root)
        overrider.enable()
        self.addCleanup(overrider.disable)
        careers = Page.get_first_root_node().add_child(instance=CareersPage(title="Careers", slug="careers"))
        self.job = careers.add_child(instance=JobPage(title="SCADA Engineer", slug="scada-engineer"))
        self.closed = careers.add_child(instance=JobPage(title="Filled", slug="filled", is_open=False))

    def _apply(self, **overrides):
        data = {
            "job": self.job.pk, "name": "Asha Rao", "email": "asha@example.org", "phone": "+91 98765 43210",
            "linkedin": "https://linkedin.com/in/asha", "experience": "6 years", "message": "I run a 40 MW SCADA desk.",
            "consent": "true", "cv": SimpleUploadedFile("Asha Rao CV.pdf", PDF, content_type="application/pdf"),
        }
        data.update(overrides)
        cache.clear()  # the 5/hour limit is tested on its own below
        return APIClient().post(APPLY_URL, {k: v for k, v in data.items() if v is not None}, format="multipart")

    def test_application_is_saved_privately_and_the_inbox_is_told(self):
        from pages.models import JobApplication
        res = self._apply()
        self.assertEqual(res.status_code, 201, res.content)
        application = JobApplication.objects.get()
        self.assertEqual((application.job, application.status, application.email_sent), (self.job, "new", True))
        self.assertIsNotNone(application.consent_at)
        # Random name in private storage: not the applicant's file name, not under MEDIA_ROOT.
        self.assertNotIn("Asha", application.cv.name)
        self.assertTrue(application.cv.path.startswith(self.private_root))
        with self.assertRaises(ValueError):
            application.cv.url
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("SCADA Engineer", mail.outbox[0].subject)
        self.assertIn(f"pages/jobapplication/{application.pk}/change/", mail.outbox[0].body)
        self.assertEqual(mail.outbox[0].attachments, [])  # the CV never travels by email

    def test_refusals(self):
        from pages.models import JobApplication
        cases = {
            "job": {"job": self.closed.pk},
            "cv": {"cv": SimpleUploadedFile("cv.pdf", b"MZ not a pdf", content_type="application/pdf")},
            "consent": {"consent": "false"},
            "phone": {"phone": "call me"},
        }
        for field, override in cases.items():
            res = self._apply(**override)
            self.assertEqual(res.status_code, 400, field)
            self.assertIn(field, res.json(), field)
        big = SimpleUploadedFile("cv.pdf", PDF + b"0" * (5 * 1024 * 1024), content_type="application/pdf")
        self.assertIn("cv", self._apply(cv=big).json())
        self.assertIn("cv", self._apply(cv=SimpleUploadedFile("cv.docx", PDF)).json())
        self.assertFalse(JobApplication.objects.exists())

    def test_rate_limited(self):
        def post():
            pdf = SimpleUploadedFile("cv.pdf", PDF, content_type="application/pdf")
            return APIClient().post(APPLY_URL, {"job": self.job.pk, "name": "A", "email": "x", "phone": "1", "consent": "true", "cv": pdf}, format="multipart")
        codes = [post().status_code for _ in range(6)]
        self.assertEqual(codes[-1], 429)

    def test_honeypot_keeps_nothing(self):
        from pages.models import JobApplication
        self.assertEqual(self._apply(website="spam.example").status_code, 201)
        self.assertFalse(JobApplication.objects.exists())
        self.assertEqual(mail.outbox, [])

    def test_admin_downloads_the_cv_and_deleting_removes_the_file(self):
        import os
        from django.conf import settings
        from accounts.models import User
        from pages.models import JobApplication
        self._apply()
        application = JobApplication.objects.get()
        path = application.cv.path
        cv_url = f"/{settings.DJANGO_ADMIN_PATH}pages/jobapplication/{application.pk}/cv/"

        self.assertNotEqual(self.client.get(cv_url).status_code, 200)  # signed out: sent to the login page
        self.client.force_login(User.objects.create_superuser("root", "root@example.org", "Passw0rd!x"))
        page = self.client.get(f"/{settings.DJANGO_ADMIN_PATH}pages/jobapplication/{application.pk}/change/")
        self.assertContains(page, cv_url)
        res = self.client.get(cv_url)
        self.assertEqual(res.status_code, 200)
        self.assertIn("attachment", res["Content-Disposition"])
        self.assertEqual(b"".join(res.streaming_content), PDF)

        application.delete()
        self.assertFalse(os.path.exists(path))
