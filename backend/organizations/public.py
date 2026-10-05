"""
The public company page (/c/<slug> on GeLearn): who the company is, what it
has published, and the verified experts who publish under its name.
"""
from accounts.models import User
from accounts.roles import display_company

from .models import Company

ITEMS_PER_SECTION = 6


def _image(obj):
    image = getattr(obj, "image", None)
    return image.file.url if image else None


def _card(obj, path, meta=""):
    date = getattr(obj, "date", None)
    return {
        "id": obj.pk,
        "title": obj.title,
        "path": path,
        "image_url": _image(obj),
        "date": date.isoformat() if date else None,
        "meta": meta,
    }


def company_page(company: Company):
    # Imported here: pages/learning import accounts, which import organizations.
    from learning.models import Playlist
    from pages.models import CaseStudy, PodcastEpisode, TechArticle, Tender, Whitepaper

    sections = [
        ("geacademy", "GeAcademy", TechArticle.objects.filter(company=company).order_by("-date"),
         lambda o: _card(o, f"/geacademy/{o.pk}", o.read_time)),
        ("research", "Research", CaseStudy.objects.filter(company=company).order_by("-date"),
         lambda o: _card(o, f"/research/{o.pk}", o.read_time)),
        ("policies_tenders", "Policies & Tenders", Tender.objects.filter(company=company).order_by("-id"),
         lambda o: _card(o, "/policies-tenders", f"{o.status} · {o.authority}")),
        ("whitepapers", "Whitepapers", Whitepaper.objects.filter(company=company).order_by("-date"),
         lambda o: _card(o, "/whitepapers", o.pages)),
        ("podcasts", "Podcasts", PodcastEpisode.objects.filter(company=company).order_by("-date"),
         lambda o: _card(o, f"/podcasts/{o.pk}", o.duration)),
    ]
    content = []
    for key, label, queryset, card in sections:
        count = queryset.count()
        if count:
            content.append({
                "key": key, "label": label, "count": count,
                "items": [card(o) for o in queryset.select_related()[:ITEMS_PER_SECTION]],
            })

    experts = (
        User.objects.filter(
            company=company, account_type=User.ACCOUNT_PROFESSIONAL, company_verified=True, is_active=True,
        )
        .select_related("avatar", "company__logo")
        .order_by("display_name")
    )
    courses = (
        Playlist.objects.filter(status=Playlist.STATUS_PUBLISHED, owner__in=experts)
        .select_related("owner", "cover")
        .order_by("-updated_at")[:ITEMS_PER_SECTION]
    )

    return {
        "name": company.name,
        "slug": company.slug,
        "logo_url": company.logo_url,
        "website": company.website,
        "description": company.description,
        "content": content,
        "experts": [
            {
                "username": u.username,
                "display_name": u.display_name,
                "avatar_url": u.avatar.file.url if u.avatar else None,
                "role_title": u.role_title,
                "company": display_company(u),
            }
            for u in experts
        ],
        "courses": [
            {
                "slug": c.slug,
                "title": c.title,
                "cover_url": c.cover.file.url if c.cover_id else None,
                "owner_name": c.owner.display_name or c.owner.username,
                "access": c.access,
                "price": str(c.price) if c.price is not None else None,
                "currency": c.currency,
            }
            for c in courses
        ],
    }
