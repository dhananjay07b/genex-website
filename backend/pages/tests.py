from decimal import Decimal

from django.contrib.admin.sites import AdminSite
from django.test import RequestFactory, TestCase
from rest_framework.test import APIClient

from accounts.models import User
from organizations.models import Company

from .admin import UserBlogPostAdmin, UserVideoPostAdmin
from .models import UserBlogPost, UserVideoPost

BODY = "<p>" + "Grid operations at scale. " * 12 + "</p>"


def make_user(username, **kwargs):
    return User.objects.create_user(username=username, email=f"{username}@example.org", password="Passw0rd!x", **kwargs)


class SubmissionRoleTests(TestCase):
    def setUp(self):
        self.api = APIClient()
        self.pro = make_user("pro", account_type="professional", company_other="Acme", role_title="Eng")
        self.learner = make_user("learner")

    def _post(self, **extra):
        payload = {"title": "Field notes", "excerpt": "An excerpt long enough.", "body": BODY, "status": "pending"}
        payload.update(extra)
        return self.api.post("/api/snippets/blog-submissions/", payload, format="json")

    def test_only_professionals_can_submit(self):
        self.api.force_authenticate(self.learner)
        self.assertEqual(self._post().status_code, 403)
        self.assertEqual(self.api.get("/api/snippets/video-submissions/").status_code, 403)
        company = make_user("co", account_type="company", company=Company.objects.create(name="C", slug="c"))
        self.api.force_authenticate(company)
        self.assertEqual(self._post().status_code, 403)
        self.api.force_authenticate(self.pro)
        self.assertEqual(self._post().status_code, 201)

    def test_body_is_sanitised_but_keeps_rich_formatting(self):
        self.api.force_authenticate(self.pro)
        body = BODY + '<p onclick="x()"><u>u</u><s>s</s><img src="https://cdn.example/a.png" onerror="alert(1)"><script>bad()</script><a href="javascript:x()">j</a></p><iframe src="https://evil"></iframe>'
        res = self._post(body=body)
        self.assertEqual(res.status_code, 201, res.content)
        stored = UserBlogPost.objects.get().body
        for bad in ("onclick", "onerror", "<script", "javascript:", "<iframe"):
            self.assertNotIn(bad, stored)
        for kept in ("<u>u</u>", "<s>s</s>", 'src="https://cdn.example/a.png"'):
            self.assertIn(kept, stored)

    def test_paid_needs_price_and_free_clears_it(self):
        self.api.force_authenticate(self.pro)
        self.assertIn("price", self._post(access="paid").json())
        res = self._post(access="members", price="99")
        self.assertEqual(res.status_code, 201, res.content)
        self.assertEqual((res.json()["access"], res.json()["price"]), ("members", None))


class ApprovalCarriesAccessTests(TestCase):
    def setUp(self):
        self.pro = make_user("pro", account_type="professional", company_other="Acme", role_title="Eng")
        self.admin = User.objects.create_superuser("root", "root@example.org", "Passw0rd!x")
        self.request = RequestFactory().post("/")
        self.request.user = self.admin

    def test_blog_approval_publishes_access_price_and_clean_body(self):
        submission = UserBlogPost.objects.create(
            author=self.pro, title="Paid deep dive", excerpt="e", status="pending",
            body=BODY + "<p onclick='x()'>raw</p>", access="paid", price=Decimal("499"),
        )
        UserBlogPostAdmin(UserBlogPost, AdminSite()).approve_and_publish(self.request, UserBlogPost.objects.filter(pk=submission.pk))
        post = UserBlogPost.objects.get(pk=submission.pk).published_post
        self.assertEqual((post.access, post.price), ("paid", Decimal("499")))
        self.assertNotIn("onclick", str(post.body.raw_data))
        self.assertEqual(post.access_owner_ids(), {self.pro.pk})

    def test_video_approval_publishes_access(self):
        submission = UserVideoPost.objects.create(
            author=self.pro, title="Members video", excerpt="e", video_url="https://v.example/1",
            topic="Grid", duration="5 min", status="pending", access="members",
        )
        UserVideoPostAdmin(UserVideoPost, AdminSite()).approve_and_publish(self.request, UserVideoPost.objects.filter(pk=submission.pk))
        self.assertEqual(UserVideoPost.objects.get(pk=submission.pk).published_video.access, "members")



class GeLearnPhase1ContentTests(TestCase):
    """Topics with groups, parsed durations, and tender deadlines as dates."""

    def test_parse_duration_seconds(self):
        from .durations import parse_duration_seconds
        cases = {
            "14:32 min": 872, "20:00": 1200, "1:02:10": 3730, "48 min": 2880,
            "1 h 20 min": 4800, "2h": 7200, "40": 2400, "": None, "soon": None,
        }
        for text, expected in cases.items():
            self.assertEqual(parse_duration_seconds(text), expected, text)

    def test_video_and_podcast_store_duration_seconds(self):
        import datetime
        from .models import PodcastEpisode, VideoItem
        video = VideoItem.objects.create(title="V", category="Training", date=datetime.date(2026, 10, 1),
                                         duration="9:40 min", excerpt="e")
        self.assertEqual(video.duration_seconds, 580)
        video.duration = "12 min"
        video.save()
        self.assertEqual(video.duration_seconds, 720)
        episode = PodcastEpisode.objects.create(title="P", category="Solar", date=datetime.date(2026, 10, 1),
                                                duration="48 min", description="d", guest="g", guest_role="r")
        self.assertEqual(episode.duration_seconds, 2880)

    def test_topics_api_includes_group(self):
        from .models import Topic
        api = APIClient()
        rows = {row["name"]: row for row in api.get("/api/snippets/topics/").json()}
        # Seeded by pages/0039.
        self.assertEqual(rows["Solar PV"]["group"], "Renewables")
        self.assertEqual(rows["SCADA & Monitoring"]["group"], "Automation & data")
        Topic.objects.create(name="Ungrouped topic")
        rows = {row["name"]: row for row in api.get("/api/snippets/topics/").json()}
        self.assertIsNone(rows["Ungrouped topic"]["group"])

    def test_tender_deadline_is_a_date_in_the_api(self):
        import datetime
        from .models import Tender
        Tender.objects.create(title="T", authority="CEA", deadline=datetime.date(2026, 6, 30),
                              value="v", sector="Grid", description="d")
        row = APIClient().get("/api/snippets/tenders/").json()["results"][0]
        self.assertEqual(row["deadline"], "2026-06-30")

    def test_testimonial_defaults(self):
        from .models import Testimonial
        t = Testimonial.objects.create(quote="Useful.", name="A. Learner")
        self.assertTrue(t.is_active)


class TopicHousekeepingTests(TestCase):
    """Usage counts and merging topics (CMS → Snippets → Topics)."""

    def setUp(self):
        import datetime
        from .models import CaseStudy, Topic, VideoItem
        self.a = Topic.objects.create(name="Topic A")
        self.b = Topic.objects.create(name="Topic B")
        self.target = Topic.objects.create(name="Target")
        day = datetime.date(2026, 10, 1)
        self.study = CaseStudy.objects.create(title="S", category="c", category_color="bg-primary", excerpt="e", date=day)
        self.video = VideoItem.objects.create(title="V", category="c", date=day, duration="5 min", excerpt="e")
        self.pro = make_user("pro", account_type="professional", company_other="Acme")
        self.study.topics.add(self.a, self.b)          # tagged with both sources
        self.video.topics.add(self.a, self.target)     # already has the target
        self.pro.expertise.add(self.b)

    def test_usage_counts_every_relation(self):
        from .models import Topic
        from .topics import with_usage
        usage = {t.name: t.usage for t in with_usage(Topic.objects.filter(pk__in=[self.a.pk, self.b.pk, self.target.pk]))}
        self.assertEqual(usage, {"Topic A": 2, "Topic B": 2, "Target": 1})

    def test_merge_moves_tags_without_duplicates_and_deletes_sources(self):
        from .models import Topic
        from .topics import merge_topics
        merge_topics([self.a, self.b], self.target)
        self.assertFalse(Topic.objects.filter(pk__in=[self.a.pk, self.b.pk]).exists())
        self.assertEqual(list(self.study.topics.all()), [self.target])
        self.assertEqual(list(self.video.topics.all()), [self.target])
        self.assertEqual(list(self.pro.expertise.all()), [self.target])

    def test_merge_bulk_action_in_the_cms(self):
        from .models import Topic
        admin = User.objects.create_superuser("root", "root@example.org", "Passw0rd!x")
        self.client.force_login(admin)
        url = f"/cms/bulk/pages/topic/merge_topics/?next=/cms/&id={self.a.pk}&id={self.b.pk}"
        page = self.client.get(url)
        self.assertEqual(page.status_code, 200)
        self.assertContains(page, "used by 2 items")
        res = self.client.post(url, {"target": self.target.pk})
        self.assertEqual(res.status_code, 302)
        self.assertFalse(Topic.objects.filter(pk__in=[self.a.pk, self.b.pk]).exists())
        self.assertEqual(list(self.study.topics.all()), [self.target])

    def test_topics_list_shows_usage_column(self):
        admin = User.objects.create_superuser("root", "root@example.org", "Passw0rd!x")
        self.client.force_login(admin)
        page = self.client.get("/cms/snippets/pages/topic/")
        self.assertEqual(page.status_code, 200)
        self.assertContains(page, "Used by")


class LinkPickerTests(TestCase):
    """CMS links are picked, never typed (pages/links.py)."""

    def setUp(self):
        from learning.models import CareerRole, Playlist
        from .links import LinkBlock
        self.block = LinkBlock()
        self.optional = LinkBlock(optional=True)
        self.solar = __import__("pages.models", fromlist=["Topic"]).Topic.objects.get(name="Solar PV")
        self.role = CareerRole.objects.get(slug="scada-engineer")
        self.company = Company.objects.create(name="Genex Technocrats", slug="genex")
        owner = make_user("pro", account_type="professional", company_other="Acme")
        self.course = Playlist.objects.create(owner=owner, title="SCADA Fundamentals", status="published")

    def url(self, raw, block=None):
        block = block or self.block
        return block.get_api_representation(block.to_python(raw))

    def test_every_link_type_builds_its_address(self):
        self.assertEqual(self.url({"link_type": "page", "page": "for_companies"}), "/for-companies")
        self.assertEqual(self.url({"link_type": "page", "page": "my_learning"}), "/account?tab=learning")
        self.assertEqual(self.url({"link_type": "topic", "topic": self.solar.pk}), "/topics/solar")
        self.assertEqual(self.url({"link_type": "role", "role": self.role.pk}), "/roles/scada-engineer")
        self.assertEqual(self.url({"link_type": "company", "company": self.company.pk}), "/c/genex")
        self.assertEqual(self.url({"link_type": "course", "course": self.course.pk}), "/courses/scada-fundamentals")
        self.assertEqual(self.url({"link_type": "url", "url": "https://example.org/x"}), "https://example.org/x")
        self.assertEqual(self.url({"link_type": "none"}, self.optional), "")

    def test_search_filters_build_the_query_in_a_fixed_order(self):
        raw = {"link_type": "search", "search": {
            "q": " IEC 61850 ", "type": "course", "level": "beginner", "access": "free",
            "topic": self.solar.pk, "max_minutes": "20"}}
        self.assertEqual(self.url(raw), "/search?q=IEC+61850&type=course&level=beginner&access=free&topic=solar&max_minutes=20")
        self.assertEqual(self.url({"link_type": "search", "search": {}}), "/search")

    def test_links_follow_renames_and_drop_hidden_targets(self):
        self.solar.slug = "solar-pv"
        self.solar.save()
        self.assertEqual(self.url({"link_type": "topic", "topic": self.solar.pk}), "/topics/solar-pv")
        self.course.status = "draft"
        self.course.save()
        self.assertEqual(self.url({"link_type": "course", "course": self.course.pk}), "")

    def test_validation(self):
        from django.core.exceptions import ValidationError
        for raw in ({"link_type": "topic"}, {"link_type": "url", "url": "/typed-path"}, {"link_type": "none"}):
            with self.assertRaises(ValidationError, msg=raw):
                self.block.clean(self.block.to_python(raw))
        self.optional.clean(self.optional.to_python({"link_type": "none"}))
        self.block.clean(self.block.to_python({"link_type": "page", "page": "courses"}))

    def test_typed_addresses_convert_to_choices(self):
        import importlib
        from django.apps import apps
        convert = importlib.import_module("pages.migrations.0043_convert_typed_links")
        self.assertEqual(convert.to_link(apps, "/for-companies"), {"link_type": "page", "page": "for_companies"})
        self.assertEqual(convert.to_link(apps, "/search?type=course&level=beginner"),
                         {"link_type": "search", "search": {"type": "course", "level": "beginner"}})
        self.assertEqual(convert.to_link(apps, "/topics/solar"), {"link_type": "topic", "topic": self.solar.pk})
        self.assertEqual(convert.to_link(apps, "/somewhere-else"), {"link_type": "legacy", "url": "/somewhere-else"})
        self.assertEqual(convert.to_link(apps, ""), {"link_type": "none"})
        self.assertEqual(convert.to_text(apps, {"link_type": "search", "search": {"type": "course", "topic": self.solar.pk}}),
                         "/search?type=course&topic=solar")

    def test_course_and_company_choosers_list_only_live_items(self):
        admin = User.objects.create_superuser("root", "root@example.org", "Passw0rd!x")
        Company.objects.create(name="Dormant Co", slug="dormant", is_active=False)
        self.client.force_login(admin)
        page = self.client.get("/cms/choose/company/")
        self.assertEqual(page.status_code, 200)
        self.assertContains(page, "Genex Technocrats")
        self.assertNotContains(page, "Dormant Co")
        found = self.client.get("/cms/choose/course/results/?q=scada")
        self.assertContains(found, "SCADA Fundamentals")

    def test_cms_editor_loads_link_picker_script(self):
        from wagtail.models import Page
        from .models import GeLearnIndexPage
        admin = User.objects.create_superuser("root", "root@example.org", "Passw0rd!x")
        self.client.force_login(admin)
        page = Page.objects.get(depth=1).add_child(instance=GeLearnIndexPage(
            title="GeLearn", slug="gelearn-links-test",
            home_sections=[("promo_pair", {"promos": [{"heading": "H", "link_url": {"link_type": "page", "page": "courses"}}]})],
        ))
        res = self.client.get(f"/cms/pages/{page.pk}/edit/")
        self.assertEqual(res.status_code, 200)
        self.assertContains(res, "pages/js/link_block.js")


class MarketingLinkPickerTests(TestCase):
    """The same picker on the marketing site: its own pages relative, GeLearn's absolute, page sections."""

    def setUp(self):
        from django.conf import settings
        from wagtail.models import Page
        from .links import LinkBlock
        from .models import ContactPage, HomePage
        self.marketing = LinkBlock(site="marketing", optional=True)
        self.gelearn = LinkBlock()
        root = Page.objects.get(depth=1)
        self.contact = ContactPage.objects.first() or root.add_child(instance=ContactPage(title="Contact", slug="contact-test"))
        self.home = HomePage.objects.first()
        self.gelearn_base = settings.GELEARN_FRONTEND_URL.rstrip("/")
        self.marketing_base = settings.MARKETING_FRONTEND_URL.rstrip("/")

    def url(self, block, raw):
        return block.get_api_representation(block.to_python(raw))

    def test_marketing_links(self):
        contact_path = self.contact.url_path.rstrip("/")
        self.assertEqual(self.url(self.marketing, {"link_type": "genex_page", "genex_page": self.contact.pk, "section": "demo"}),
                         f"{contact_path}#demo")
        self.assertEqual(self.url(self.marketing, {"link_type": "page", "page": "courses"}), f"{self.gelearn_base}/courses")
        self.assertEqual(list(self.marketing.child_blocks["link_type"].field.choices)[:2],
                         [("none", "No link"), ("genex_page", "A page on this website")])
        if self.home:
            self.assertEqual(self.url(self.marketing, {"link_type": "genex_page", "genex_page": self.home.pk}), "/")

    def test_gelearn_link_to_a_genex_page_is_absolute(self):
        contact_path = self.contact.url_path.rstrip("/")
        self.assertEqual(self.url(self.gelearn, {"link_type": "genex_page", "genex_page": self.contact.pk}),
                         f"{self.marketing_base}{contact_path}")

    def test_old_typed_addresses_still_save_but_new_typed_paths_do_not(self):
        from django.core.exceptions import ValidationError
        legacy = {"link_type": "legacy", "url": "/portfolio/scada"}
        self.marketing.clean(self.marketing.to_python(legacy))
        self.assertEqual(self.url(self.marketing, legacy), "/portfolio/scada")
        with self.assertRaises(ValidationError):
            self.marketing.clean(self.marketing.to_python({"link_type": "url", "url": "/portfolio/scada"}))

    def test_marketing_conversion(self):
        import importlib
        from django.apps import apps
        convert = importlib.import_module("pages.migrations.0045_convert_marketing_links")
        Page = apps.get_model("wagtailcore", "Page")
        contact_path = self.contact.url_path.rstrip("/")
        self.assertEqual(convert.to_link(Page, f"{contact_path}#demo", 999),
                         {"link_type": "genex_page", "genex_page": self.contact.pk, "section": "demo"})
        self.assertEqual(convert.to_link(Page, "#form", self.contact.pk),
                         {"link_type": "genex_page", "genex_page": self.contact.pk, "section": "form"})
        self.assertEqual(convert.to_link(Page, "/portfolio/not-yet-built", 1), {"link_type": "legacy", "url": "/portfolio/not-yet-built"})
        self.assertEqual(convert.to_link(Page, "https://aws.amazon.com", 1), {"link_type": "url", "url": "https://aws.amazon.com"})
        self.assertEqual(convert.to_link(Page, "", 1), {"link_type": "none"})
        self.assertEqual(convert.to_text(Page, {"link_type": "genex_page", "genex_page": self.contact.pk, "section": "apply"}),
                         f"{contact_path}#apply")

    def test_site_settings_header_button(self):
        from .models import SiteSettings
        from wagtail.models import Site
        settings_row = SiteSettings.for_site(Site.objects.get(is_default_site=True))
        self.assertEqual(settings_row.cta_href, "/contact#demo")  # nothing picked yet: the default
        settings_row.cta_page, settings_row.cta_section = self.contact, "demo"
        self.assertEqual(settings_row.cta_href, f"{self.contact.url_path.rstrip('/')}#demo")
