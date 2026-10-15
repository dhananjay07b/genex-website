"""
Search engines on the CMS host (cms.genextechnocrats.com). People should find the
frontend sites, not the API or the CMS behind them.
"""
from django.http import HttpResponse

# Only the admin areas are blocked. /api/ and /media/ must stay crawlable: Google
# fetches them to render the frontends' pages (their text and images come from here).
ROBOTS_TXT = "User-agent: *\nDisallow: /cms/\nDisallow: /admin/\n"


def robots_txt(request):
    return HttpResponse(ROBOTS_TXT, content_type="text/plain")


def noindex_middleware(get_response):
    """Keeps every Django response out of search results, except uploaded documents
    (whitepapers and other PDFs), which are worth finding."""
    def middleware(request):
        response = get_response(request)
        if not request.path.startswith("/documents/"):
            response.setdefault("X-Robots-Tag", "noindex")
        return response
    return middleware
