from django.core.exceptions import ValidationError
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from organizations.models import Company, CompanyDomain

from .models import User
from .roles import display_company, is_admin, is_company, is_contributor, is_learner, is_professional


def make_user(username, **kwargs):
    kwargs.setdefault("email", f"{username}@example.org")
    return User.objects.create_user(username=username, password="Passw0rd!x", **kwargs)


class RoleTests(TestCase):
    def setUp(self):
        self.google = Company.objects.create(name="Google", slug="google")
        CompanyDomain.objects.create(company=self.google, domain="google.com")

    def test_role_helpers(self):
        admin = User.objects.create_superuser("root", "root@example.org", "Passw0rd!x")
        staff = make_user("staff", account_type="company", company=self.google)
        pro = make_user("pro", account_type="professional", company_other="Acme")
        learner = make_user("learner")
        self.assertTrue(is_admin(admin))
        self.assertTrue(is_company(staff) and is_contributor(staff))
        self.assertTrue(is_professional(pro) and is_contributor(pro))
        self.assertTrue(is_learner(learner))
        self.assertFalse(is_contributor(learner) or is_admin(staff))

    def test_display_company(self):
        staff = make_user("staff", account_type="company", company=self.google)
        self.assertTrue(display_company(staff)["verified"])

        other = make_user("other", account_type="professional", company_other="Acme")
        self.assertEqual(display_company(other), {"name": "Acme", "slug": None, "logo_url": None, "verified": False})

        pending = make_user("pending", email="p@google.com", account_type="professional", company=self.google)
        self.assertFalse(display_company(pending)["verified"])

        self.assertIsNone(display_company(make_user("learner")))

    def test_inactive_company_loses_verification_display(self):
        pro = make_user("pro", email="p@google.com", account_type="professional", company=self.google,
                        company_verified=True, company_verified_at=timezone.now())
        self.google.is_active = False
        self.google.save()
        pro.refresh_from_db()
        self.assertIsNone(display_company(pro))


class UserModelRuleTests(TestCase):
    def setUp(self):
        self.google = Company.objects.create(name="Google", slug="google")

    def test_company_account_requires_company_and_email(self):
        user = User(username="c", account_type="company")
        with self.assertRaises(ValidationError) as ctx:
            user.full_clean()
        self.assertIn("company", ctx.exception.message_dict)
        self.assertIn("email", ctx.exception.message_dict)

    def test_learner_cannot_link_company(self):
        user = User(username="l", email="l@x.org", account_type="learner", company=self.google)
        user.set_password("Passw0rd!x")
        with self.assertRaises(ValidationError) as ctx:
            user.full_clean()
        self.assertIn("company", ctx.exception.message_dict)

    def test_duplicate_email_rejected_case_insensitively(self):
        make_user("a", email="Same@x.org")
        user = User(username="b", email="same@X.org")
        user.set_password("Passw0rd!x")
        with self.assertRaises(ValidationError) as ctx:
            user.full_clean()
        self.assertIn("email", ctx.exception.message_dict)

    def test_verification_resets_when_email_or_company_changes(self):
        pro = make_user("pro", email="p@google.com", account_type="professional", company=self.google,
                        company_verified=True, company_verified_at=timezone.now())
        pro.email = "p@elsewhere.com"
        pro.save(update_fields=["email"])
        pro.refresh_from_db()
        self.assertFalse(pro.company_verified)
        self.assertIsNone(pro.company_verified_at)


class BackofficeAccessTests(TestCase):
    """/admin and /cms are superuser-only."""

    def setUp(self):
        self.google = Company.objects.create(name="Google", slug="google")

    def _assert_blocked(self, user):
        self.client.force_login(user)
        self.assertEqual(self.client.get("/cms/").status_code, 404)
        self.assertEqual(self.client.get("/admin/").status_code, 404)

    def test_superuser_allowed(self):
        self.client.force_login(User.objects.create_superuser("root", "root@example.org", "Passw0rd!x"))
        self.assertEqual(self.client.get("/admin/").status_code, 200)
        self.assertEqual(self.client.get("/cms/").status_code, 200)

    def test_staff_non_superuser_blocked(self):
        self._assert_blocked(make_user("staffer", is_staff=True))

    def test_company_user_blocked(self):
        self._assert_blocked(make_user("co", account_type="company", company=self.google))

    def test_professional_and_learner_blocked(self):
        self._assert_blocked(make_user("pro", account_type="professional", company_other="Acme"))
        self._assert_blocked(make_user("learner"))

    def test_staff_non_superuser_cannot_log_in_to_admin(self):
        make_user("staffer", is_staff=True)
        res = self.client.post("/admin/login/", {"username": "staffer", "password": "Passw0rd!x"})
        self.assertEqual(res.status_code, 200)  # form re-rendered with an error, no redirect
        self.assertNotIn("_auth_user_id", self.client.session)

    def test_anonymous_sees_login_pages(self):
        self.assertEqual(self.client.get("/admin/login/").status_code, 200)
        self.assertEqual(self.client.get("/cms/login/").status_code, 200)


class AccountTypeApiTests(TestCase):
    def setUp(self):
        from django.core.cache import cache
        cache.clear()  # registration is throttled per IP
        self.api = APIClient()

    def _register(self, **extra):
        payload = {
            "username": "newbie", "email": "newbie@example.org",
            "password1": "Str0ng!Passw0rd", "password2": "Str0ng!Passw0rd",
        }
        payload.update(extra)
        return self.api.post("/api/auth/registration/", payload, format="json")

    def test_register_defaults_to_learner(self):
        res = self._register()
        self.assertIn(res.status_code, (200, 201), res.content)
        self.assertEqual(User.objects.get(username="newbie").account_type, "learner")

    def test_register_professional_with_unlisted_company(self):
        res = self._register(account_type="professional", company_other=" Acme ", role_title="Engineer")
        self.assertIn(res.status_code, (200, 201), res.content)
        user = User.objects.get(username="newbie")
        self.assertEqual((user.account_type, user.company_other), ("professional", "Acme"))

    def test_register_professional_requires_company_and_role(self):
        res = self._register(account_type="professional")
        self.assertEqual(res.status_code, 400)
        self.assertIn("company_id", res.json())
        res = self._register(account_type="professional", company_other="Acme")
        self.assertEqual(res.status_code, 400)
        self.assertIn("role_title", res.json())

    def test_cannot_self_register_as_company(self):
        res = self._register(account_type="company")
        self.assertEqual(res.status_code, 400)
        self.assertIn("account_type", res.json())
        self.assertFalse(User.objects.filter(username="newbie").exists())

    def test_me_cannot_upgrade_to_company(self):
        user = make_user("me")
        self.api.force_authenticate(user)
        res = self.api.patch("/api/accounts/me/", {"account_type": "company"}, format="json")
        self.assertEqual(res.status_code, 400)

    def test_company_user_cannot_change_type(self):
        google = Company.objects.create(name="Google", slug="google")
        user = make_user("co", account_type="company", company=google)
        self.api.force_authenticate(user)
        res = self.api.patch("/api/accounts/me/", {"account_type": "learner"}, format="json")
        self.assertEqual(res.status_code, 400)

    def test_switch_to_learner_clears_company(self):
        user = make_user("pro", account_type="professional", company_other="Acme", role_title="Eng")
        self.api.force_authenticate(user)
        res = self.api.patch("/api/accounts/me/", {"account_type": "learner"}, format="json")
        self.assertEqual(res.status_code, 200, res.content)
        user.refresh_from_db()
        self.assertEqual((user.account_type, user.company_other), ("learner", ""))

    def test_me_exposes_role_fields(self):
        user = make_user("pro", account_type="professional", company_other="Acme", role_title="Eng")
        self.api.force_authenticate(user)
        body = self.api.get("/api/accounts/me/").json()
        self.assertEqual(body["account_type"], "professional")
        self.assertFalse(body["is_admin"])
        self.assertEqual(body["company"], {"name": "Acme", "slug": None, "logo_url": None, "verified": False})


class CompanyVerificationFlowTests(TestCase):
    """Professional ↔ Company domain verification, end to end through the real endpoints."""

    def setUp(self):
        from django.core.cache import cache
        cache.clear()  # registration is throttled per IP
        self.api = APIClient()
        self.google = Company.objects.create(name="Google", slug="google")
        CompanyDomain.objects.create(company=self.google, domain="google.com")

    def _register(self, email, **extra):
        payload = {
            "username": email.split("@")[0], "email": email,
            "password1": "Str0ng!Passw0rd", "password2": "Str0ng!Passw0rd",
            "account_type": "professional", "role_title": "Engineer",
        }
        payload.update(extra)
        return self.api.post("/api/auth/registration/", payload, format="json")

    def _confirm_latest_email(self):
        import re

        from django.core import mail
        key = re.search(r"/verify-email/([^\s/]+)", mail.outbox[-1].body).group(1)
        res = self.api.post("/api/auth/registration/verify-email/", {"key": key}, format="json")
        self.assertEqual(res.status_code, 200, res.content)

    def test_matching_domain_links_company_and_verifies_after_email_confirmation(self):
        res = self._register("expert@google.com", company_id=self.google.id)
        self.assertIn(res.status_code, (200, 201), res.content)
        user = User.objects.get(username="expert")
        self.assertEqual(user.company, self.google)
        self.assertFalse(user.company_verified)  # not until the email is confirmed

        self._confirm_latest_email()
        user.refresh_from_db()
        self.assertTrue(user.company_verified)
        self.assertIsNotNone(user.company_verified_at)
        self.assertTrue(display_company(user)["verified"])

    def test_subdomain_email_accepted(self):
        res = self._register("expert@in.google.com", company_id=self.google.id)
        self.assertIn(res.status_code, (200, 201), res.content)

    def test_mismatched_domain_rejected_on_email_field(self):
        res = self._register("expert@gmail.com", company_id=self.google.id)
        self.assertEqual(res.status_code, 400)
        self.assertIn("@google.com", res.json()["email"][0])
        self.assertFalse(User.objects.filter(username="expert").exists())

    def test_inactive_or_unknown_company_rejected(self):
        self.google.is_active = False
        self.google.save()
        self.assertIn("company_id", self._register("expert@google.com", company_id=self.google.id).json())
        self.assertIn("company_id", self._register("expert@google.com", company_id=99999).json())

    def test_other_cannot_impersonate_a_listed_company(self):
        res = self._register("expert@gmail.com", company_other="google")
        self.assertEqual(res.status_code, 400)
        self.assertIn("company_other", res.json())

    def test_other_company_registers_unverified(self):
        res = self._register("expert@acme.io", company_other="Acme Energy")
        self.assertIn(res.status_code, (200, 201), res.content)
        self._confirm_latest_email()
        user = User.objects.get(username="expert")
        self.assertIsNone(user.company)
        self.assertFalse(user.company_verified)

    def test_learner_upgrade_with_confirmed_email_verifies_immediately(self):
        from allauth.account.models import EmailAddress
        user = make_user("learner", email="learner@google.com")
        EmailAddress.objects.create(user=user, email=user.email, verified=True, primary=True)
        self.api.force_authenticate(user)
        res = self.api.patch("/api/accounts/me/", {
            "account_type": "professional", "company_id": self.google.id, "role_title": "SRE",
        }, format="json")
        self.assertEqual(res.status_code, 200, res.content)
        self.assertTrue(res.json()["company_verified"])
        self.assertEqual(res.json()["company"]["slug"], "google")

    def test_me_company_mismatch_reported_on_company_field(self):
        user = make_user("pro", email="pro@acme.io", account_type="professional", company_other="Acme", role_title="Eng")
        self.api.force_authenticate(user)
        res = self.api.patch("/api/accounts/me/", {"company_id": self.google.id}, format="json")
        self.assertEqual(res.status_code, 400)
        self.assertIn("company_id", res.json())

    def test_switching_to_other_drops_link_and_badge(self):
        from allauth.account.models import EmailAddress
        user = make_user("pro", email="pro@google.com", account_type="professional", company=self.google, role_title="Eng")
        EmailAddress.objects.create(user=user, email=user.email, verified=True, primary=True)
        from .verification import refresh_company_verification
        self.assertTrue(refresh_company_verification(user))
        self.api.force_authenticate(user)
        res = self.api.patch("/api/accounts/me/", {"company_id": None, "company_other": "Acme"}, format="json")
        self.assertEqual(res.status_code, 200, res.content)
        user.refresh_from_db()
        self.assertEqual((user.company, user.company_other, user.company_verified), (None, "Acme", False))

    def test_removing_domain_or_deactivating_company_revokes_badge(self):
        from allauth.account.models import EmailAddress

        from .verification import refresh_company_members, refresh_company_verification
        user = make_user("pro", email="pro@google.com", account_type="professional", company=self.google, role_title="Eng")
        EmailAddress.objects.create(user=user, email=user.email, verified=True, primary=True)
        self.assertTrue(refresh_company_verification(user))

        self.google.domains.all().delete()
        refresh_company_members(self.google)
        user.refresh_from_db()
        self.assertFalse(user.company_verified)

        CompanyDomain.objects.create(company=self.google, domain="google.com")
        refresh_company_members(self.google)
        user.refresh_from_db()
        self.assertTrue(user.company_verified)

        self.google.is_active = False
        self.google.save()
        refresh_company_members(self.google)
        user.refresh_from_db()
        self.assertFalse(user.company_verified)

    def test_registration_uses_its_own_throttle_scope(self):
        from .views import GenexRegisterView, GenexResendEmailView
        self.assertEqual(GenexRegisterView.throttle_scope, "registration")
        self.assertEqual(GenexResendEmailView.throttle_scope, "resend-email")


class AuthorPayloadTests(TestCase):
    def test_author_payload_carries_company_display(self):
        from pages.api import author_payload
        google = Company.objects.create(name="Google", slug="google")
        staff = make_user("staff", account_type="company", company=google)
        payload = author_payload(staff)
        self.assertEqual(payload["account_type"], "company")
        self.assertEqual(payload["company"], {"name": "Google", "slug": "google", "logo_url": None, "verified": True})
