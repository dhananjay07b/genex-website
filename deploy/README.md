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

System packages (Ubuntu 24.04 LTS, which ships Python 3.12). `python3-venv` isn't
installed by default, and the Pango/HarfBuzz libraries are what WeasyPrint needs to
draw certificate PDFs:
```bash
sudo apt update
sudo apt install python3-venv python3-dev libpango-1.0-0 libpangoft2-1.0-0 libharfbuzz-subset0 \
    postgresql apache2 certbot python3-certbot-apache
```
To build the frontend on the server, install Node.js 22 LTS (e.g. from NodeSource):
Ubuntu's own `nodejs` package is 18, too old for Vite (needs 20.19+ or 22.12+).

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

## Database (PostgreSQL 16)

Ubuntu 24.04's `postgresql` package is version 16, the same as local development.
It listens on localhost only, which is what we want: never open port 5432 in the
EC2 security group.

```bash
sudo -u postgres psql -c "CREATE ROLE genex LOGIN PASSWORD '<a strong password>';"
sudo -u postgres psql -c "CREATE DATABASE genex OWNER genex;"
```
Put the same name, user and password in `.env` (`POSTGRES_*`, see
`deploy/gunicorn/genex-backend.env.example`).

### Moving the local data to the server (once, at launch)

Do this into the new, empty database **before** running `migrate` below. On the
development machine:
```bash
pg_dump -h 127.0.0.1 -U genex -d genex -Fc > genex.dump   # asks for the genex password
tar czf genex-media.tgz -C backend media      # uploaded images and documents
scp genex.dump genex-media.tgz <user>@<server>:/tmp/
```
On the server:
```bash
pg_restore --no-owner --role=genex -h 127.0.0.1 -U genex -d genex /tmp/genex.dump
sudo tar xzf /tmp/genex-media.tgz -C /var/www/genex/backend
sudo chown -R www-data:www-data /var/www/genex/backend/media
```

### Backups

A nightly dump, keeping the last 14 days:
```bash
sudo install -d -o postgres -g postgres -m 700 /var/backups/genex
echo '30 2 * * * postgres pg_dump -Fc genex > /var/backups/genex/genex-$(date +\%F).dump && find /var/backups/genex -name "genex-*.dump" -mtime +14 -delete' \
  | sudo tee /etc/cron.d/genex-db-backup
```
Copy these off the server too (e.g. to S3), along with `backend/media`: a backup
on the same disk doesn't survive losing the instance.

To restore one (stop the backend first):
```bash
sudo systemctl stop genex-backend
sudo -u postgres pg_restore --clean --if-exists -d genex /var/backups/genex/genex-YYYY-MM-DD.dump
sudo systemctl start genex-backend
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
# Resized copies of uploaded images (what the API serves); re-run after restoring media
python manage.py warm_image_renditions

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
