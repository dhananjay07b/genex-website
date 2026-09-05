"""
Idempotent seed command — safe to re-run after schema changes.
Creates all Wagtail pages and snippets from frontend data in seed_data.py.
Images are NOT seeded (upload manually via /cms/images/).
"""

import json
import uuid

from django.core.management.base import BaseCommand
from wagtail.models import Page, Site

from pages.models import (
    AboutPage,
    BlogPost,
    CareersPage,
    CaseStudy,
    ContactPage,
    GeLearnIndexPage,
    GeLearnSectionPage,
    HomePage,
    InnovationPage,
    InnovationsIndexPage,
    MediaPage,
    PodcastEpisode,
    PortfolioIndexPage,
    ProductPage,
    TeamPage,
    Tender,
    TechArticle,
    VideoItem,
    Whitepaper,
)
from pages.seed_data import (
    ABOUT_DATA,
    BLOG_POSTS,
    CAREERS_DATA,
    CASE_STUDIES,
    CONTACT_DATA,
    FAQ_ITEMS,
    HOMEPAGE_DATA,
    HOW_WE_WORK_DATA,
    INNOVATION_PRODUCTS,
    PODCASTS,
    PORTFOLIO_PRODUCTS,
    TEAM_DATA,
    TENDERS,
    VIDEOS,
    WHITEPAPERS,
)


def _uid():
    return str(uuid.uuid4())


def _stream(*items):
    """Convert (type, value) tuples to Wagtail StreamField JSON."""
    return json.dumps([{"type": t, "id": _uid(), "value": v} for t, v in items])


def _list_stream(type_name, values):
    """Convert a list of values to StreamField JSON with a single block type."""
    return json.dumps([{"type": type_name, "id": _uid(), "value": v} for v in values])


class Command(BaseCommand):
    help = "Seed all Wagtail pages and snippets from frontend data"

    def handle(self, *args, **options):
        self.stdout.write("Starting seed...")

        root = Page.objects.filter(depth=1).first()
        if not root:
            self.stderr.write("No root page found — run migrate first.")
            return

        # Snippets first (no page hierarchy dependency)
        self._seed_case_studies()
        self._seed_blog_posts()
        self._seed_tenders()
        self._seed_whitepapers()
        self._seed_videos()
        self._seed_podcasts()

        # Pages in hierarchy order
        self._seed_homepage(root)
        self._seed_portfolio(root)
        self._seed_innovations(root)
        self._seed_gelearn(root)
        self._seed_about(root)
        self._seed_careers(root)
        self._seed_contact(root)

        self.stdout.write(self.style.SUCCESS("Seed complete."))

    # ------------------------------------------------------------------
    # Snippets
    # ------------------------------------------------------------------

    def _seed_case_studies(self):
        for d in CASE_STUDIES:
            if CaseStudy.objects.filter(title=d["title"]).exists():
                continue
            CaseStudy.objects.create(
                title=d["title"],
                category=d["category"],
                category_color=d["category_color"],
                excerpt=d["excerpt"],
                date=d["date"],
                read_time=d["read_time"],
            )
            self.stdout.write(f"  Created CaseStudy: {d['title'][:60]}")

    def _seed_blog_posts(self):
        for d in BLOG_POSTS:
            if BlogPost.objects.filter(title=d["title"]).exists():
                continue
            BlogPost.objects.create(
                title=d["title"],
                topic=d["topic"],
                date=d["date"],
                excerpt=d["excerpt"],
                body=_stream(),
            )
            self.stdout.write(f"  Created BlogPost: {d['title'][:60]}")

    def _seed_tenders(self):
        for d in TENDERS:
            if Tender.objects.filter(title=d["title"]).exists():
                continue
            Tender.objects.create(
                title=d["title"],
                authority=d["authority"],
                deadline=d["deadline"],
                value=d["value"],
                status=d["status"],
                sector=d["sector"],
                description=d["description"],
            )
            self.stdout.write(f"  Created Tender: {d['title'][:60]}")

    def _seed_whitepapers(self):
        for d in WHITEPAPERS:
            if Whitepaper.objects.filter(title=d["title"]).exists():
                continue
            Whitepaper.objects.create(
                title=d["title"],
                category=d["category"],
                category_bg=d["category_bg"],
                category_text=d["category_text"],
                date=d["date"],
                pages=d["pages"],
                description=d["description"],
            )
            self.stdout.write(f"  Created Whitepaper: {d['title'][:60]}")

    def _seed_videos(self):
        for d in VIDEOS:
            if VideoItem.objects.filter(title=d["title"]).exists():
                continue
            VideoItem.objects.create(
                title=d["title"],
                category=d["category"],
                category_color=d["category_color"],
                category_text_color=d["category_text_color"],
                date=d["date"],
                duration=d["duration"],
                excerpt=d["excerpt"],
            )
            self.stdout.write(f"  Created VideoItem: {d['title'][:60]}")

    def _seed_podcasts(self):
        for d in PODCASTS:
            if PodcastEpisode.objects.filter(title=d["title"]).exists():
                continue
            PodcastEpisode.objects.create(
                title=d["title"],
                category=d["category"],
                category_bg=d["category_bg"],
                category_text=d["category_text"],
                date=d["date"],
                duration=d["duration"],
                description=d["description"],
                guest=d["guest"],
                guest_role=d["guest_role"],
            )
            self.stdout.write(f"  Created PodcastEpisode: {d['title'][:60]}")

    # ------------------------------------------------------------------
    # Pages
    # ------------------------------------------------------------------

    def _get_or_create_child(self, parent, model, slug, defaults):
        """Get existing page by slug (of correct type) or create it as child of parent."""
        existing = model.objects.filter(slug=slug).first()
        if existing:
            return existing, False
        # If a generic placeholder page occupies this slug, delete it first
        from wagtail.models import Page as WagtailPage
        placeholder = WagtailPage.objects.filter(slug=slug).first()
        if placeholder and not isinstance(placeholder.specific, model):
            placeholder.delete()
            # Refresh parent from DB so treebeard sees the updated numchild
            parent.refresh_from_db()
        page = model(slug=slug, live=True, **defaults)
        parent.add_child(instance=page)
        return page, True

    def _seed_homepage(self, root):
        hp = HOMEPAGE_DATA

        hero_slides = _list_stream("slide", [
            {
                "headline": s["headline"],
                "subline": s.get("subline", ""),
                "media_type": s.get("media_type", "image"),
                "background_image": None,
                "background_video": s.get("background_video", ""),
                "cta_text": s.get("cta_text", ""),
                "cta_link": s.get("cta_link", ""),
            }
            for s in hp["hero_slides"]
        ])

        credibility_strip = _list_stream("client", [
            {"name": name} for name in hp["credibility_clients"]
        ])

        impact_stats = _list_stream("stat", hp["impact_stats"])

        what_we_build = _list_stream("tab", [
            {
                "id": t["id"],
                "label": t["label"],
                "badge": t.get("badge", ""),
                "headline": t["headline"],
                "body": t["body"],
                "points": t["points"],
                "href": t["href"],
                "image": None,
            }
            for t in hp["what_we_build"]
        ])

        edge_section = _list_stream("section", [
            {
                "heading": "",
                "image": None,
                "statements": [
                    {"title": s["title"], "body": s["body"]}
                    for s in hp["edge_statements"]
                ],
            }
        ])

        projects_showcase = _list_stream("item", [
            {
                "name": p["name"],
                "location": p.get("location", ""),
                "metric": p.get("metric", ""),
                "image": None,
                "href": p.get("href", ""),
                "gradient": p.get("gradient", ""),
            }
            for p in hp["projects_showcase"]
        ])

        innovations_teaser = _list_stream("item", hp["innovations_teaser"])

        world_map = _list_stream("map", [
            {
                "heading": "",
                "pins": hp["world_map_pins"],
                "stats": hp["world_map_stats"],
                "bullet_points": [],
            }
        ])

        tech_partners = _list_stream("partner", hp["tech_partners"])

        testimonials = _list_stream("item", hp["testimonials"])

        gelearn_teaser = _list_stream("card", hp["gelearn_cards"])

        cta_section = _list_stream("cta", [hp["cta"]])

        home, created = self._get_or_create_child(
            root,
            HomePage,
            "home",
            {
                "title": "Home",
                "draft_title": "Home",
                "hero_slides": hero_slides,
                "credibility_strip": credibility_strip,
                "impact_stats": impact_stats,
                "what_we_build": what_we_build,
                "edge_section": edge_section,
                "projects_showcase": projects_showcase,
                "innovations_teaser": innovations_teaser,
                "world_map": world_map,
                "tech_partners": tech_partners,
                "testimonials": testimonials,
                "gelearn_teaser": gelearn_teaser,
                "cta_section": cta_section,
                "event_banner": "[]",
                "app_download": "[]",
            },
        )
        if created:
            self.stdout.write("  Created HomePage")

        # Wire Wagtail Site to the root page (depth 1) so API scopes to whole tree
        if not Site.objects.filter(is_default_site=True).exists():
            Site.objects.create(
                hostname="localhost",
                port=8000,
                root_page=root,
                is_default_site=True,
                site_name="Genex Technocrats",
            )
            self.stdout.write("  Created default Wagtail Site")
        else:
            # Ensure existing site uses the tree root, not a content page
            site = Site.objects.filter(is_default_site=True).first()
            if site and site.root_page.depth != 1:
                site.root_page = root
                site.save()
                self.stdout.write("  Updated Site root_page to Wagtail root")

    def _seed_portfolio(self, root):
        index, created = self._get_or_create_child(
            root,
            PortfolioIndexPage,
            "portfolio",
            {
                "title": "Portfolio",
                "draft_title": "Portfolio",
                "intro_headline": "Our Products",
                "intro_body": "Full-stack energy monitoring and control platforms — from edge hardware to cloud dashboards.",
                "stats": "[]",
                "cta": "[]",
            },
        )
        if created:
            self.stdout.write("  Created PortfolioIndexPage")

        for d in PORTFOLIO_PRODUCTS:
            if ProductPage.objects.filter(slug=d["slug"]).exists():
                continue
            page = ProductPage(
                title=d["title"],
                draft_title=d["title"],
                slug=d["slug"],
                live=True,
                badge=d.get("badge", ""),
                family=d.get("family", "solar"),
                headline=d.get("headline", ""),
                subline=d.get("subline", ""),
                gradient=d.get("gradient", ""),
                overview=_list_stream("paragraph", d["overview"]),
                capabilities=_list_stream("item", d["capabilities"]),
                tech_highlights=_list_stream("item", d["tech_highlights"]),
                stats=_list_stream("stat", d["stats"]),
                cta="[]",
            )
            index.add_child(instance=page)
            self.stdout.write(f"  Created ProductPage: {d['slug']}")

    def _seed_innovations(self, root):
        index, created = self._get_or_create_child(
            root,
            InnovationsIndexPage,
            "innovations",
            {
                "title": "Innovations",
                "draft_title": "Innovations",
                "intro_headline": "What We're Building Next",
                "intro_body": "R&D and advanced development across AI, storage, grid, and EV domains.",
                "cta": "[]",
            },
        )
        if created:
            self.stdout.write("  Created InnovationsIndexPage")

        for d in INNOVATION_PRODUCTS:
            if InnovationPage.objects.filter(slug=d["slug"]).exists():
                continue
            page = InnovationPage(
                title=d["title"],
                draft_title=d["title"],
                slug=d["slug"],
                live=True,
                badge=d.get("badge", ""),
                category=d.get("category", "monitoring"),
                stage=d.get("stage", "deployed"),
                headline=d.get("headline", ""),
                subline=d.get("subline", ""),
                gradient=d.get("gradient", ""),
                overview=_list_stream("paragraph", d["overview"]),
                capabilities=_list_stream("item", d["capabilities"]),
                tech_highlights=_list_stream("item", d["tech_highlights"]),
                stats=_list_stream("stat", d["stats"]),
                cta="[]",
            )
            index.add_child(instance=page)
            self.stdout.write(f"  Created InnovationPage: {d['slug']}")

    def _seed_gelearn(self, root):
        index, created = self._get_or_create_child(
            root,
            GeLearnIndexPage,
            "gelearn",
            {
                "title": "GeLearn",
                "draft_title": "GeLearn",
                "intro_headline": "Learn from the field.",
                "body": "[]",
            },
        )
        if created:
            self.stdout.write("  Created GeLearnIndexPage")

        sections = [
            ("how-we-work", "How We Work", "how-we-work"),
            ("technology", "Technology Deep Dives", "technology"),
            ("case-studies", "Case Studies", "case-studies"),
            ("tenders", "Tenders & Opportunities", "tenders"),
            ("whitepapers", "Whitepapers & Reports", "whitepapers"),
            ("videos", "Video Library", "videos"),
            ("blog", "Blog & Insights", "blog"),
            ("faq", "FAQ", "faq"),
            ("podcasts", "Podcasts & Interviews", "podcasts"),
        ]

        for slug, title, section_type in sections:
            if GeLearnSectionPage.objects.filter(slug=slug).exists():
                continue

            if slug == "how-we-work":
                body = _list_stream("how_we_work", [
                    {
                        "steps": HOW_WE_WORK_DATA["steps"],
                        "principles": HOW_WE_WORK_DATA["principles"],
                    }
                ])
            elif slug == "faq":
                sections_grouped: dict = {}
                for item in FAQ_ITEMS:
                    sections_grouped.setdefault(item["section"], []).append(
                        {"question": item["q"], "answer": item["a"]}
                    )
                faq_sections = [
                    {"section_title": sec, "items": items}
                    for sec, items in sections_grouped.items()
                ]
                body = _list_stream("faq_section", faq_sections)
            else:
                body = "[]"

            page = GeLearnSectionPage(
                title=title,
                draft_title=title,
                slug=slug,
                live=True,
                section_type=section_type,
                body=body,
            )
            index.add_child(instance=page)
            self.stdout.write(f"  Created GeLearnSectionPage: {slug}")

    def _seed_about(self, root):
        ad = ABOUT_DATA

        milestones_stream = _list_stream("milestones", [
            [  # ListBlock value is a list
                {
                    "year": m["year"],
                    "label": m["label"],
                    "title": m["title"],
                    "description": m["description"],
                    "is_current": m.get("is_current", False),
                }
                for m in ad["milestones"]
            ]
        ])

        stats_stream = _list_stream("stats_section", [
            {"heading": "", "bg": "", "stats": ad["stats"]}
        ])

        vision_stream = _list_stream("vision_cards", [
            [{"icon": c["icon"], "title": c["title"], "text": c["text"]} for c in ad["vision_cards"]]
        ])

        mission_stream = _list_stream("mission_points", [
            [{"icon": c["icon"], "title": c["title"], "text": c["text"]} for c in ad["mission_points"]]
        ])

        leadership_stream = _list_stream("leadership", [
            [
                {"title": l["title"], "bio": l["bio"], "initials": l["initials"], "linkedin": ""}
                for l in ad["leadership"]
            ]
        ])

        partners_stream = _list_stream("partner_names", [ad["partners"]])

        certs_stream = _list_stream("certifications", [
            [{"name": c["name"], "label": c["label"]} for c in ad["certifications"]]
        ])

        cta_stream = _list_stream("cta", [
            {
                "heading": "Ready to work with us?",
                "description": "",
                "primary_cta_text": "Contact Us",
                "primary_cta_link": "/contact",
                "secondary_cta_text": "",
                "secondary_cta_link": "",
            }
        ])

        body = json.loads(milestones_stream) + json.loads(stats_stream) + \
               json.loads(vision_stream) + json.loads(mission_stream) + \
               json.loads(leadership_stream) + json.loads(partners_stream) + \
               json.loads(certs_stream) + json.loads(cta_stream)

        about, created = self._get_or_create_child(
            root,
            AboutPage,
            "about",
            {
                "title": "About",
                "draft_title": "About",
                "body": json.dumps(body),
            },
        )
        if created:
            self.stdout.write("  Created AboutPage")

        # MediaPage
        if not MediaPage.objects.filter(slug="media").exists():
            media = MediaPage(
                title="Media",
                draft_title="Media",
                slug="media",
                live=True,
                body="[]",
            )
            about.add_child(instance=media)
            self.stdout.write("  Created MediaPage")

        # TeamPage
        if not TeamPage.objects.filter(slug="teams").exists():
            td = TEAM_DATA
            leader_stream = _list_stream("leader", [
                {
                    "name": td["leader"]["name"],
                    "role": td["leader"]["role"],
                    "image": None,
                    "quote": td["leader"]["quote"],
                }
            ])

            section_stream = _list_stream("section", [
                {
                    "title": sec["title"],
                    "description": sec.get("description", ""),
                    "members": [
                        {"name": m["name"], "role": m["role"], "image": None}
                        for m in sec["members"]
                    ],
                }
                for sec in td["sections"]
            ])

            team_body = json.loads(leader_stream) + json.loads(section_stream)
            team = TeamPage(
                title="Our Team",
                draft_title="Our Team",
                slug="teams",
                live=True,
                body=json.dumps(team_body),
            )
            about.add_child(instance=team)
            self.stdout.write("  Created TeamPage")

    def _seed_careers(self, root):
        cd = CAREERS_DATA

        why_stream = _list_stream("why_genex", [
            [{"icon": c["icon"], "title": c["title"], "description": c["description"]}
             for c in cd["why_genex"]]
        ])

        roles_stream = _list_stream("open_roles", [
            [
                {
                    "title": r["title"],
                    "department": r["department"],
                    "location": r["location"],
                    "type": r["type"],
                    "description": r["description"],
                }
                for r in cd["open_roles"]
            ]
        ])

        perks_stream = _list_stream("perks", [cd["perks"]])

        cta_stream = _list_stream("cta", [
            {
                "heading": "Join the team.",
                "description": "Engineers building energy infrastructure for India.",
                "primary_cta_text": "Apply Now",
                "primary_cta_link": "/careers#apply",
                "secondary_cta_text": "",
                "secondary_cta_link": "",
            }
        ])

        body = json.loads(why_stream) + json.loads(roles_stream) + \
               json.loads(perks_stream) + json.loads(cta_stream)

        _, created = self._get_or_create_child(
            root,
            CareersPage,
            "careers",
            {
                "title": "Careers",
                "draft_title": "Careers",
                "body": json.dumps(body),
            },
        )
        if created:
            self.stdout.write("  Created CareersPage")

    def _seed_contact(self, root):
        cdata = CONTACT_DATA

        details_stream = _list_stream("contact_details", [
            [
                {
                    "icon": d["icon"],
                    "label": d["label"],
                    "lines": d["lines"],
                    "note": d.get("note", ""),
                }
                for d in cdata["contact_details"]
            ]
        ])

        types_stream = _list_stream("project_types", [
            [{"value": t["value"], "label": t["label"]} for t in cdata["project_types"]]
        ])

        cta_stream = _list_stream("cta", [
            {
                "heading": "Let's talk.",
                "description": "Tell us about your project and we'll get back to you within 48 hours.",
                "primary_cta_text": "Send Message",
                "primary_cta_link": "#form",
                "secondary_cta_text": "",
                "secondary_cta_link": "",
            }
        ])

        body = json.loads(details_stream) + json.loads(types_stream) + json.loads(cta_stream)

        _, created = self._get_or_create_child(
            root,
            ContactPage,
            "contact",
            {
                "title": "Contact",
                "draft_title": "Contact",
                "body": json.dumps(body),
            },
        )
        if created:
            self.stdout.write("  Created ContactPage")
