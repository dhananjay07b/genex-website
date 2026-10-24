# Genex backend: Django/Wagtail served by gunicorn. Built by docker-compose.yml at
# the repo root; settings come from the environment (genex.settings.production).
FROM python:3.12-slim-bookworm

# XDG_CACHE_HOME: the app user can't write to its home (/app), so Fontconfig's cache goes to /tmp.
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    XDG_CACHE_HOME=/tmp/.cache

# Pango/HarfBuzz: WeasyPrint draws certificate PDFs with them. The certificate's own
# fonts ship in learning/certificate_assets; DejaVu is only a fallback.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libpango-1.0-0 libpangoft2-1.0-0 libharfbuzz-subset0 fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

# Runs as an unprivileged user. media/, private/ (CVs) and staticfiles/ are created
# here so the named volumes mounted over them start out owned by this user.
RUN useradd --uid 10001 --no-create-home --home-dir /app --shell /usr/sbin/nologin genex \
    && mkdir -p media private staticfiles \
    && chown -R genex:genex media private staticfiles \
    && chmod +x docker-entrypoint.sh
USER genex

EXPOSE 8000
ENTRYPOINT ["./docker-entrypoint.sh"]
# Certificate PDFs and images are drawn on request, so allow a slow one (Nginx waits 60s too).
CMD ["gunicorn", "genex.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "60", "--access-logfile", "-"]
