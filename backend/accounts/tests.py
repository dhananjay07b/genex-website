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

    def test_account_type_is_fixed_after_registration(self):
        pro = make_user("pro", account_type="professional", company_other="Acme", role_title="Eng")
        learner = make_user("learner2")
        for user, target in ((pro, "learner"), (learner, "professional")):
            self.api.force_authenticate(user)
            res = self.api.patch("/api/accounts/me/", {"account_type": target, "role_title": "Eng", "company_other": "Acme"}, format="json")
            self.assertEqual(res.status_code, 400, res.content)
            self.assertIn("Contact us", res.json()["account_type"][0])
            user.refresh_from_db()
            self.assertNotEqual(user.account_type, target)

    def test_sending_the_current_type_is_harmless(self):
        user = make_user("pro", account_type="professional", company_other="Acme", role_title="Eng")
        self.api.force_authenticate(user)
        res = self.api.patch("/api/accounts/me/", {"account_type": "professional", "bio": "Hi"}, format="json")
        self.assertEqual(res.status_code, 200, res.content)

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

    def test_personal_email_links_the_company_but_stays_unverified(self):
        res = self._register("expert@gmail.com", company_id=self.google.id)
        self.assertIn(res.status_code, (200, 201), res.content)
        self._confirm_latest_email()  # confirming a Gmail address proves nothing about Google-the-company
        user = User.objects.get(username="expert")
        self.assertEqual(user.company, self.google)
        self.assertFalse(user.company_verified)
        self.assertFalse(display_company(user)["verified"])

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

    def test_linking_a_company_with_confirmed_email_verifies_immediately(self):
        from allauth.account.models import EmailAddress
        user = make_user("pro", email="pro@google.com", account_type="professional", company_other="Acme", role_title="SRE")
        EmailAddress.objects.create(user=user, email=user.email, verified=True, primary=True)
        self.api.force_authenticate(user)
        res = self.api.patch("/api/accounts/me/", {"company_id": self.google.id}, format="json")
        self.assertEqual(res.status_code, 200, res.content)
        self.assertTrue(res.json()["company_verified"])
        self.assertEqual(res.json()["company"]["slug"], "google")

    def test_me_can_link_a_company_without_its_email_unverified(self):
        user = make_user("pro", email="pro@acme.io", account_type="professional", company_other="Acme", role_title="Eng")
        self.api.force_authenticate(user)
        res = self.api.patch("/api/accounts/me/", {"company_id": self.google.id}, format="json")
        self.assertEqual(res.status_code, 200, res.content)
        self.assertEqual(res.json()["company"]["slug"], "google")
        self.assertFalse(res.json()["company_verified"])

    def test_unchanged_other_name_still_saves_after_that_company_is_registered(self):
        user = make_user("early", email="early@gmail.com", account_type="professional", company_other="Solar Co", role_title="Eng")
        Company.objects.create(name="Solar Co", slug="solar-co")
        self.api.force_authenticate(user)
        res = self.api.patch("/api/accounts/me/", {"bio": "Hi", "company_id": None, "company_other": "Solar Co", "role_title": "Eng"}, format="json")
        self.assertEqual(res.status_code, 200, res.content)
        # Typing a registered company's name afresh is still refused: pick it from the list instead.
        res = self.api.patch("/api/accounts/me/", {"company_id": None, "company_other": "Google", "role_title": "Eng"}, format="json")
        self.assertIn("company_other", res.json())

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


    def test_admin_email_change_can_still_be_confirmed_and_verifies(self):
        """Admin moves a Professional onto the company email: Resend link must work, and confirming verifies them."""
        from django.contrib.admin.sites import AdminSite
        from django.core import mail
        from django.test import RequestFactory

        from .admin import UserAdmin
        user = make_user("moved", account_type="professional", company=self.google)
        user.email = "moved@google.com"
        request = RequestFactory().post("/")
        request.user = user
        UserAdmin(User, AdminSite()).save_model(request, user, form=None, change=True)
        mail.outbox.clear()

        self.api.force_authenticate(user)
        self.api.post("/api/auth/registration/resend-email/", {"email": "moved@google.com"}, format="json")
        self.assertEqual(len(mail.outbox), 1)
        self._confirm_latest_email()
        user.refresh_from_db()
        self.assertTrue(user.company_verified)


class AuthorPayloadTests(TestCase):
    def test_author_payload_carries_company_display(self):
        from pages.api import author_payload
        google = Company.objects.create(name="Google", slug="google")
        staff = make_user("staff", account_type="company", company=google)
        payload = author_payload(staff)
        self.assertEqual(payload["account_type"], "company")
        self.assertEqual(payload["company"], {"name": "Google", "slug": "google", "logo_url": None, "verified": True})


class FeaturedProfessionalTests(TestCase):
    """GeLearn featuring and rating are Admin-only fields on Professionals."""

    def test_only_professionals_can_be_featured(self):
        learner = make_user("learner1", is_featured=True)
        with self.assertRaises(ValidationError) as ctx:
            learner.full_clean()
        self.assertIn("is_featured", ctx.exception.message_dict)
        pro = make_user("pro1", account_type="professional", company_other="Acme", is_featured=True)
        pro.full_clean()

    def test_rating_must_be_between_0_and_5(self):
        from decimal import Decimal
        pro = make_user("pro2", account_type="professional", company_other="Acme", gelearn_rating=Decimal("5.5"))
        with self.assertRaises(ValidationError):
            pro.full_clean()
        pro.gelearn_rating = Decimal("4.8")
        pro.full_clean()

    def test_users_cannot_feature_or_rate_themselves(self):
        pro = make_user("pro3", account_type="professional", company_other="Acme")
        api = APIClient()
        api.force_authenticate(pro)
        api.patch("/api/accounts/me/", {"is_featured": True, "gelearn_rating": "5.0", "featured_order": 1}, format="json")
        pro.refresh_from_db()
        self.assertEqual((pro.is_featured, pro.gelearn_rating, pro.featured_order), (False, None, 0))


class LogoutTests(TestCase):
    """A logout must end every kind of sign-in, so a refresh afterwards comes back signed out."""

    def setUp(self):
        self.user = make_user("member")
        self.client = APIClient(enforce_csrf_checks=True)

    def logout_and_reload(self):
        self.assertEqual(self.client.get("/api/accounts/me/").status_code, 200)
        csrf = self.client.cookies["csrftoken"].value
        self.assertEqual(self.client.post("/api/auth/logout/", HTTP_X_CSRFTOKEN=csrf).status_code, 200)
        # A browser drops the cookies the logout deleted; the test client keeps them as "".
        for name in [name for name, cookie in self.client.cookies.items() if not cookie.value]:
            del self.client.cookies[name]
        self.assertEqual(self.client.get("/api/accounts/me/").status_code, 401)
        self.assertEqual(self.client.post("/api/auth/token/refresh/", HTTP_X_CSRFTOKEN=csrf).status_code, 401)

    def test_email_login(self):
        self.client.post("/api/auth/login/", {"email": "member@example.org", "password": "Passw0rd!x"}, format="json")
        self.logout_and_reload()

    def test_registration_session(self):
        """Registration signs the new user in with a Django session, not the JWT cookies."""
        self.client.post(
            "/api/auth/registration/",
            {"username": "newbie", "email": "newbie@example.org", "password1": "Passw0rd!xyz",
             "password2": "Passw0rd!xyz", "display_name": "Newbie", "account_type": "learner"},
            format="json",
        )
        self.assertIn("sessionid", self.client.cookies)
        self.logout_and_reload()

    def test_django_session(self):
        self.client.force_login(self.user)
        self.logout_and_reload()

    def test_expired_access_cookie(self):
        """A stale access cookie must not turn the logout into a 401."""
        self.client.cookies["genex-auth"] = "expired.or.garbage"
        self.assertEqual(self.client.post("/api/auth/logout/").status_code, 200)


class AuthRateLimitTests(TestCase):
    """Login and password endpoints allow 10 attempts per 15 minutes, then a plain-language 429."""

    def setUp(self):
        from django.core.cache import cache
        cache.clear()
        self.client = APIClient(enforce_csrf_checks=False)
        self.user = make_user("ratelimit")

    def _login(self, email, password="wrong-password", ip="10.0.0.1"):
        return self.client.post("/api/auth/login/", {"email": email, "password": password}, format="json", REMOTE_ADDR=ip)

    def test_eleventh_login_attempt_is_refused_with_a_clear_message(self):
        for _ in range(10):
            self.assertEqual(self._login(self.user.email).status_code, 400)
        res = self._login(self.user.email, password="Passw0rd!x")  # even the right password
        self.assertEqual(res.status_code, 429)
        self.assertRegex(res.json()["detail"], r"^Too many attempts\. Please try again in (a minute|\d+ minutes)\.$")
        self.assertIn("Retry-After", res)

    def test_limit_is_per_email_and_network(self):
        for _ in range(10):
            self._login(self.user.email)
        other = make_user("colleague")
        self.assertEqual(self._login(other.email, password="Passw0rd!x").status_code, 200)  # same office IP
        self.assertEqual(self._login(self.user.email, password="Passw0rd!x", ip="10.0.0.2").status_code, 200)

    def test_faked_forwarded_for_header_does_not_reset_the_count(self):
        for i in range(10):
            self.client.post("/api/auth/login/", {"email": self.user.email, "password": "x"}, format="json",
                             REMOTE_ADDR="10.0.0.1", HTTP_X_FORWARDED_FOR=f"1.2.3.{i}")
        res = self.client.post("/api/auth/login/", {"email": self.user.email, "password": "x"}, format="json",
                               REMOTE_ADDR="10.0.0.1", HTTP_X_FORWARDED_FOR="9.9.9.9")
        self.assertEqual(res.status_code, 429)

    def test_password_reset_request_is_limited(self):
        for _ in range(10):
            res = self.client.post("/api/auth/password/reset/", {"email": self.user.email}, format="json")
            self.assertEqual(res.status_code, 200)
        res = self.client.post("/api/auth/password/reset/", {"email": self.user.email}, format="json")
        self.assertEqual(res.status_code, 429)

    def test_password_reset_confirm_is_limited(self):
        body = {"uid": "x", "token": "y", "new_password1": "N3wPassw0rd!", "new_password2": "N3wPassw0rd!"}
        for _ in range(10):
            self.assertEqual(self.client.post("/api/auth/password/reset/confirm/", body, format="json").status_code, 400)
        self.assertEqual(self.client.post("/api/auth/password/reset/confirm/", body, format="json").status_code, 429)

    def test_password_change_is_limited_per_user(self):
        self.client.force_authenticate(self.user)
        body = {"old_password": "wrong", "new_password1": "N3wPassw0rd!", "new_password2": "N3wPassw0rd!"}
        for _ in range(10):
            self.client.post("/api/auth/password/change/", body, format="json")
        self.assertEqual(self.client.post("/api/auth/password/change/", body, format="json").status_code, 429)

    def test_window_rate_parsing(self):
        from .throttles import WindowRateThrottle
        parse = WindowRateThrottle.parse_rate
        self.assertEqual(parse(None, "10/15m"), (10, 900))
        self.assertEqual(parse(None, "5/hour"), (5, 3600))
        self.assertEqual(parse(None, "3/2h"), (3, 7200))


class DuplicateEmailTests(TestCase):
    """One account per email, ignoring case, however the existing account was made."""

    def setUp(self):
        from django.core.cache import cache
        cache.clear()  # registration is throttled per IP
        self.client = APIClient()

    def _register(self, email, username="newperson"):
        return self.client.post("/api/auth/registration/", {
            "username": username, "email": email, "password1": "Str0ng!Passw0rd", "password2": "Str0ng!Passw0rd",
        }, format="json")

    def test_email_of_account_without_an_email_record_is_refused(self):
        make_user("scripted", email="scripted@example.org")  # e.g. created in admin or by a script
        res = self._register("scripted@example.org")
        self.assertEqual(res.status_code, 400)
        self.assertIn("already exists", res.json()["email"][0])

    def test_email_of_unverified_signup_is_refused(self):
        self.assertEqual(self._register("first@example.org", username="first").status_code, 201)
        res = self._register("first@example.org", username="second")
        self.assertEqual(res.status_code, 400)
        self.assertEqual(User.objects.filter(email__iexact="first@example.org").count(), 1)

    def test_check_ignores_case(self):
        make_user("mixed", email="Mixed.Case@Example.org")
        self.assertEqual(self._register("mixed.case@example.org").status_code, 400)

    def test_database_refuses_a_duplicate_from_any_path(self):
        from django.db import IntegrityError, transaction
        make_user("one", email="same@example.org")
        with self.assertRaises(IntegrityError), transaction.atomic():
            User.objects.create_user(username="two", email="SAME@example.org", password="x")

    def test_blank_emails_are_not_treated_as_duplicates(self):
        User.objects.create_user(username="noemail1", email="", password="x")
        User.objects.create_user(username="noemail2", email="", password="x")
        self.assertEqual(User.objects.filter(email="").count(), 2)


class SessionEndpointTests(TestCase):
    """/api/accounts/session/ tells the frontend who's signed in without ever answering 401."""

    def setUp(self):
        self.client = APIClient()
        self.user = make_user("sess")

    def test_visitor_gets_200_and_a_csrf_cookie(self):
        res = self.client.get("/api/accounts/session/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json(), {"user": None, "can_refresh": False})
        self.assertIn("csrftoken", res.cookies)
        self.assertEqual(res["Cache-Control"], "no-store")

    def test_signed_in_with_jwt_cookie(self):
        from rest_framework_simplejwt.tokens import AccessToken
        self.client.cookies["genex-auth"] = str(AccessToken.for_user(self.user))
        res = self.client.get("/api/accounts/session/")
        self.assertEqual(res.json()["user"]["username"], "sess")

    def test_expired_sign_in_with_valid_refresh_cookie_can_refresh(self):
        from datetime import timedelta
        from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
        expired = AccessToken.for_user(self.user)
        expired.set_exp(lifetime=-timedelta(minutes=1))
        self.client.cookies["genex-auth"] = str(expired)
        self.client.cookies["genex-refresh"] = str(RefreshToken.for_user(self.user))
        res = self.client.get("/api/accounts/session/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json(), {"user": None, "can_refresh": True})

    def test_invalid_refresh_cookie_is_not_worth_trying(self):
        self.client.cookies["genex-refresh"] = "not-a-token"
        self.assertEqual(self.client.get("/api/accounts/session/").json(), {"user": None, "can_refresh": False})

    def test_django_session_sign_in_counts(self):
        self.client.force_login(self.user)
        self.assertEqual(self.client.get("/api/accounts/session/").json()["user"]["username"], "sess")


class GoogleSignInTests(TestCase):
    """Sign in with Google: new people choose their account type; existing accounts link only on a verified email."""

    def setUp(self):
        from django.core.cache import cache
        cache.clear()
        self.client = APIClient()
        self.acme = Company.objects.create(name="Acme Energy", slug="acme")
        CompanyDomain.objects.create(company=self.acme, domain="acme.com")

    def _google(self, email="new@gmail.com", sub="g-1", verified=True, name="Asha Rao", **body):
        from unittest import mock
        identity = {"sub": sub, "email": email, "email_verified": verified, "name": name, "given_name": "Asha", "family_name": "Rao"}
        with mock.patch("allauth.socialaccount.providers.google.views._verify_and_decode", return_value=identity):
            return self.client.post("/api/accounts/google/", {"id_token": "tok", **body}, format="json")

    def test_new_person_is_asked_for_a_profile_and_nothing_is_created(self):
        res = self._google()
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual({k: data[k] for k in ("status", "email", "name")}, {"status": "needs_profile", "email": "new@gmail.com", "name": "Asha Rao"})
        self.assertTrue(data["signup_token"])
        self.assertFalse(User.objects.filter(email="new@gmail.com").exists())
        self.assertNotIn("genex-auth", res.cookies)

    def test_new_learner(self):
        from allauth.account.models import EmailAddress
        from allauth.socialaccount.models import SocialAccount
        res = self._google(account_type="learner")
        self.assertEqual(res.json(), {"status": "signed_in", "created": True})
        self.assertIn("genex-auth", res.cookies)
        user = User.objects.get(email="new@gmail.com")
        self.assertEqual((user.account_type, user.display_name), ("learner", "Asha Rao"))
        self.assertTrue(SocialAccount.objects.filter(user=user, provider="google", uid="g-1").exists())
        self.assertTrue(EmailAddress.objects.get(user=user).verified)

    def test_new_professional_on_their_company_domain_is_verified(self):
        res = self._google(email="asha@acme.com", account_type="professional", company_id=self.acme.pk, role_title="Grid Engineer")
        self.assertEqual(res.status_code, 200)
        user = User.objects.get(email="asha@acme.com")
        self.assertEqual((user.account_type, user.company, user.role_title), ("professional", self.acme, "Grid Engineer"))
        self.assertTrue(user.company_verified)

    def test_personal_google_email_links_the_company_unverified_and_not_an_instructor(self):
        from learning.models import eligible_instructors
        res = self._google(account_type="professional", company_id=self.acme.pk, role_title="Grid Engineer")
        self.assertEqual(res.json(), {"status": "signed_in", "created": True})
        user = User.objects.get(email="new@gmail.com")
        self.assertEqual(user.company, self.acme)
        self.assertFalse(user.company_verified)  # Google confirmed a Gmail address, not an Acme one
        self.assertNotIn(user, eligible_instructors(self.acme))

    def test_professional_needs_a_role_and_can_use_other(self):
        self.assertIn("role_title", self._google(account_type="professional", company_other="Solar Co").json())
        res = self._google(account_type="professional", company_other="Solar Co", role_title="Analyst")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(User.objects.get(email="new@gmail.com").company_other, "Solar Co")

    def test_company_accounts_cannot_be_self_created(self):
        self.assertEqual(self._google(account_type="company").status_code, 400)

    def test_existing_account_links_on_a_verified_google_email(self):
        from allauth.socialaccount.models import SocialAccount
        pro = make_user("existing", email="Asha@Acme.com", account_type="professional", company=self.acme, role_title="Lead")
        res = self._google(email="asha@acme.com")
        self.assertEqual(res.json(), {"status": "signed_in", "created": False})
        self.assertTrue(SocialAccount.objects.filter(user=pro, provider="google").exists())
        pro.refresh_from_db()
        self.assertEqual(pro.account_type, "professional")  # never changed by Google
        self.assertTrue(pro.company_verified)  # Google confirmed the company email

    def test_unverified_google_email_does_not_take_over_an_account(self):
        from allauth.socialaccount.models import SocialAccount
        make_user("victim", email="new@gmail.com")
        res = self._google(verified=False)
        self.assertEqual(res.status_code, 400)
        self.assertIn("password", res.json()["detail"])
        self.assertFalse(SocialAccount.objects.exists())

    def test_returning_google_user_signs_straight_in(self):
        self._google(account_type="learner")
        self.client.cookies.clear()
        res = self._google()  # no profile needed the second time
        self.assertEqual(res.json(), {"status": "signed_in", "created": False})
        self.assertEqual(User.objects.filter(email="new@gmail.com").count(), 1)

    def test_bad_token_is_refused(self):
        res = self.client.post("/api/accounts/google/", {"id_token": "forged"}, format="json")
        self.assertIn(res.status_code, (400, 503))
        self.assertFalse(User.objects.filter(email="new@gmail.com").exists())


class WorkEmailTests(TestCase):
    """A Professional on a personal email gets verified by confirming a work email on their company's domain."""

    def setUp(self):
        from django.core.cache import cache
        cache.clear()
        self.acme = Company.objects.create(name="Acme Energy", slug="acme")
        CompanyDomain.objects.create(company=self.acme, domain="acme.com")
        self.pro = make_user("gmailpro", email="meera@gmail.com", account_type="professional",
                             company_other="Acme-ish", role_title="Engineer")
        self.client = APIClient()
        self.client.force_authenticate(self.pro)

    def _confirm_last_link(self):
        import re
        from django.core import mail
        key = re.search(r"/verify-email/([^\s/]+)", mail.outbox[-1].body).group(1)
        return APIClient().post("/api/auth/registration/verify-email/", {"key": key}, format="json")

    def test_confirming_a_work_email_links_the_company_and_verifies(self):
        from django.core import mail
        res = self.client.post("/api/accounts/me/work-email/", {"email": "Meera@Acme.com"}, format="json")
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.json(), {"email": "meera@acme.com", "verified": False, "company": {"name": "Acme Energy", "slug": "acme"}})
        self.assertEqual(mail.outbox[-1].to, ["meera@acme.com"])
        self.pro.refresh_from_db()
        self.assertFalse(self.pro.company_verified)  # not until the link is clicked

        self.assertEqual(self._confirm_last_link().status_code, 200)
        self.pro.refresh_from_db()
        self.assertEqual((self.pro.company, self.pro.company_other, self.pro.company_verified), (self.acme, "", True))
        self.assertEqual(self.pro.email, "meera@gmail.com")  # sign-in email unchanged
        self.assertTrue(self.client.get("/api/accounts/me/work-email/").json()["verified"])

    def test_removing_it_removes_verification(self):
        self.client.post("/api/accounts/me/work-email/", {"email": "meera@acme.com"}, format="json")
        self._confirm_last_link()
        self.assertEqual(self.client.delete("/api/accounts/me/work-email/").status_code, 204)
        self.pro.refresh_from_db()
        self.assertFalse(self.pro.company_verified)
        self.assertEqual(self.client.get("/api/accounts/me/work-email/").json()["email"], None)

    def test_only_registered_company_domains(self):
        res = self.client.post("/api/accounts/me/work-email/", {"email": "meera@unknown-co.com"}, format="json")
        self.assertEqual(res.status_code, 400)
        self.assertIn("registered", res.json()["email"][0])

    def test_cannot_claim_another_accounts_email(self):
        make_user("boss", email="boss@acme.com")
        res = self.client.post("/api/accounts/me/work-email/", {"email": "boss@acme.com"}, format="json")
        self.assertEqual(res.status_code, 400)
        self.assertIn("Another account", res.json()["email"][0])

    def test_pending_work_email_lets_them_pick_the_company_but_not_be_verified(self):
        self.client.post("/api/accounts/me/work-email/", {"email": "meera@acme.com"}, format="json")
        res = self.client.patch("/api/accounts/me/", {"company_id": self.acme.pk, "role_title": "Engineer"}, format="json")
        self.assertEqual(res.status_code, 200)
        self.pro.refresh_from_db()
        self.assertEqual((self.pro.company, self.pro.company_verified), (self.acme, False))

    def test_professionals_only(self):
        learner = make_user("learnerx")
        client = APIClient()
        client.force_authenticate(learner)
        self.assertEqual(client.post("/api/accounts/me/work-email/", {"email": "l@acme.com"}, format="json").status_code, 403)

    def test_sending_links_is_rate_limited(self):
        for i in range(5):
            self.client.post("/api/accounts/me/work-email/", {"email": f"m{i}@acme.com"}, format="json")
        self.assertEqual(self.client.post("/api/accounts/me/work-email/", {"email": "m9@acme.com"}, format="json").status_code, 429)


class DeactivatedCompanyTests(TestCase):
    """A deactivated company's own login loses Studio until Genex reactivates the company."""

    def test_studio_closes_for_a_deactivated_company(self):
        acme = Company.objects.create(name="Acme Energy", slug="acme")
        staff = make_user("acme_staff", account_type="company", company=acme)
        client = APIClient()
        client.force_authenticate(staff)
        self.assertEqual(client.get("/api/studio/team/").status_code, 200)
        acme.is_active = False
        acme.save()
        staff.refresh_from_db()
        client.force_authenticate(staff)
        self.assertEqual(client.get("/api/studio/team/").status_code, 403)


class GoogleTokenVerificationTests(TestCase):
    """
    The real verification path, with tokens signed by a test RS256 key in place of
    Google's: signature, audience, expiry, and allauth's one-use rule. (Mocking the
    whole check once hid a missing `cryptography` package and the reuse problem.)
    """

    def setUp(self):
        import time
        from unittest import mock
        from cryptography.hazmat.primitives.asymmetric import rsa
        from django.conf import settings
        from django.core.cache import cache
        cache.clear()
        self.key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        self.client_id = "test-client.apps.googleusercontent.com"
        self.now = int(time.time())
        patches = [
            mock.patch.dict(settings.SOCIALACCOUNT_PROVIDERS["google"]["APP"], {"client_id": self.client_id}),
            # Google's public key, normally fetched from googleapis.com.
            mock.patch("allauth.socialaccount.internal.jwtkit.fetch_key", return_value=("RS256", self.key.public_key())),
        ]
        for patch in patches:
            patch.start()
            self.addCleanup(patch.stop)
        self.client = APIClient()

    def _token(self, **claims):
        import jwt
        payload = {"iss": "https://accounts.google.com", "aud": self.client_id, "sub": "g-42", "email": "ravi@gmail.com",
                   "email_verified": True, "name": "Ravi Kumar", "iat": self.now, "exp": self.now + 3600, "jti": f"jti-{self.now}"}
        payload.update(claims)
        return jwt.encode(payload, self.key, algorithm="RS256")

    def _post(self, body):
        return self.client.post("/api/accounts/google/", body, format="json")

    def test_two_step_sign_up_with_a_real_signed_token(self):
        token = self._token()
        first = self._post({"id_token": token})
        self.assertEqual(first.status_code, 200, first.content)
        self.assertEqual(first.json()["status"], "needs_profile")
        # Google's token can't be used again...
        self.assertEqual(self._post({"id_token": token, "account_type": "learner"}).status_code, 400)
        # ...the signed ticket finishes the sign-up instead.
        second = self._post({"signup_token": first.json()["signup_token"], "account_type": "learner"})
        self.assertEqual(second.json(), {"status": "signed_in", "created": True})
        self.assertTrue(User.objects.filter(email="ravi@gmail.com", account_type="learner").exists())

    def test_wrong_audience_or_expired_or_forged_tokens_are_refused(self):
        from cryptography.hazmat.primitives.asymmetric import rsa
        import jwt
        self.assertEqual(self._post({"id_token": self._token(aud="someone-else", jti="a")}).status_code, 400)
        self.assertEqual(self._post({"id_token": self._token(exp=self.now - 10, jti="b")}).status_code, 400)
        other_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        forged = jwt.encode({"iss": "https://accounts.google.com", "aud": self.client_id, "sub": "x", "email": "x@gmail.com",
                             "exp": self.now + 3600}, other_key, algorithm="RS256")
        self.assertEqual(self._post({"id_token": forged}).status_code, 400)
        self.assertFalse(User.objects.exists())

    def test_tampered_or_expired_ticket_is_refused(self):
        from unittest import mock
        ticket = self._post({"id_token": self._token()}).json()["signup_token"]
        self.assertEqual(self._post({"signup_token": ticket + "x", "account_type": "learner"}).status_code, 400)
        with mock.patch("accounts.views.GOOGLE_SIGNUP_MAX_AGE", -1):
            res = self._post({"signup_token": ticket, "account_type": "learner"})
        self.assertEqual(res.status_code, 400)
        self.assertIn("expired", res.json()["detail"])
        self.assertFalse(User.objects.filter(email="ravi@gmail.com").exists())
