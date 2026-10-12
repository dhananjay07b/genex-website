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
