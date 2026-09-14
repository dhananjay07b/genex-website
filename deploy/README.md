# Deploying to the in-house Apache server

Three hostnames, one server:

| Hostname | Serves | Config |
|---|---|---|
| `genextechnocrats.com` | Marketing site (built frontend) | `apache/genextechnocrats.com.conf` |
| `gelearn.genextechnocrats.com` | GeLearn (same built frontend, different shell at runtime) | `apache/gelearn.genextechnocrats.com.conf` |
| `cms.genextechnocrats.com` | Django/Wagtail backend | `apache/cms.genextechnocrats.com.conf` |

The two frontend vhosts point at the **same** `frontend/dist` directory — this
is one build, not two. The app picks which shell to render (marketing vs
GeLearn) purely from `window.location.hostname` at runtime (see
`frontend/src/lib/host.ts`); Apache's only job is routing both hostnames to
the same files, and swapping `sitemap.xml`/`robots.txt` on the GeLearn vhost.

## One-time server setup

```bash
sudo a2enmod rewrite proxy proxy_http headers ssl
```

Get certificates for all three hostnames (e.g. via certbot):
```bash
sudo certbot --apache -d genextechnocrats.com -d www.genextechnocrats.com
sudo certbot --apache -d gelearn.genextechnocrats.com
sudo certbot --apache -d cms.genextechnocrats.com
```

Copy the vhost files into place and enable them:
```bash
sudo cp deploy/apache/*.conf /etc/apache2/sites-available/
sudo a2ensite genextechnocrats.com gelearn.genextechnocrats.com cms.genextechnocrats.com
sudo systemctl reload apache2
```

## Backend

```bash
cd /var/www/genex/backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt

cp deploy/gunicorn/genex-backend.env.example .env
# fill in real values in .env — see that file for what's required

export DJANGO_SETTINGS_MODULE=genex.settings.production
python manage.py migrate
python manage.py collectstatic --noinput

sudo cp deploy/gunicorn/genex-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now genex-backend
```

## Frontend

Build with the production API/subdomain URLs baked in:
```bash
cd frontend
VITE_API_BASE_URL=https://cms.genextechnocrats.com \
VITE_GELEARN_URL=https://gelearn.genextechnocrats.com \
VITE_MARKETING_URL=https://genextechnocrats.com \
npm run build
```
Copy the resulting `dist/` to `/var/www/genex/frontend/dist` (the path both
frontend Apache vhosts point at).

## After DNS is live

Once `gelearn.genextechnocrats.com` and `cms.genextechnocrats.com` actually
resolve to this server, everything works with no further code changes — the
same build already handles both hostnames, and the backend's
`CORS_ALLOWED_ORIGINS` (set in `.env` above) already expects both frontend
origins.

While the temporary pre-launch frontend is still on Vercel, this server's
backend needs `https://genextechnocrats.vercel.app` included in
`CORS_ALLOWED_ORIGINS` too — drop it once the real domains take over.
