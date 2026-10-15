# Deploying to the EC2 server (Ubuntu 24.04, Nginx)

Three hostnames, one server, served by Nginx:

| Hostname | Serves | Config (`deploy/nginx/sites-available/`) |
|---|---|---|
| `genextechnocrats.com` (`www.` redirects here) | Marketing site (built frontend) | `genextechnocrats.com.conf` |
| `gelearn.genextechnocrats.com` | GeLearn (same built frontend, different shell at runtime) | `gelearn.genextechnocrats.com.conf` |
| `cms.genextechnocrats.com` | Django/Wagtail backend: API, CMS, admin | `cms.genextechnocrats.com.conf` |

The two frontend sites serve the **same** `frontend/dist` directory: one build,
not two. The app picks which shell to render (marketing or GeLearn) from the
hostname at runtime (`frontend/src/lib/host.ts`). The GeLearn site only swaps in
its own `sitemap.xml`/`robots.txt` and redirects a few renamed sections.

Shared settings live in `deploy/nginx/snippets/`:
- `genex-common.conf`: TLS settings and compression, for every site.
- `genex-frontend-files.conf`: how the frontend files are served and cached.
- `genex-frontend-headers.conf`: security headers for the two frontend sites,
  including the Content-Security-Policy (see "Security policy" below).

## One-time server setup

System packages (Ubuntu 24.04 LTS, which ships Python 3.12). `python3-venv` isn't
installed by default, and the Pango/HarfBuzz libraries are what WeasyPrint needs to
draw certificate PDFs:
```bash
sudo apt update
sudo apt install python3-venv python3-dev libpango-1.0-0 libpangoft2-1.0-0 libharfbuzz-subset0 \
    postgresql nginx certbot python3-certbot-nginx
```
To build the frontend on the server, install Node.js 22 LTS (e.g. from NodeSource):
Ubuntu's own `nodejs` package is 18, too old for Vite (needs 20.19+ or 22.12+).

In the EC2 security group, open ports 80 and 443 only (plus SSH).

Get HTTPS certificates once DNS points all four names at this server. `certonly`
fetches the certificates without editing any Nginx files (ours already point at
them), and the deploy hook reloads Nginx after each automatic renewal:
```bash
sudo certbot certonly --nginx --deploy-hook "systemctl reload nginx" \
    -d genextechnocrats.com -d www.genextechnocrats.com
sudo certbot certonly --nginx --deploy-hook "systemctl reload nginx" -d gelearn.genextechnocrats.com
sudo certbot certonly --nginx --deploy-hook "systemctl reload nginx" -d cms.genextechnocrats.com
```

Install the Genex sites and replace Nginx's default one:
```bash
sudo cp deploy/nginx/snippets/*.conf /etc/nginx/snippets/
sudo cp deploy/nginx/sites-available/*.conf /etc/nginx/sites-available/
for site in genextechnocrats.com gelearn.genextechnocrats.com cms.genextechnocrats.com; do
    sudo ln -sf /etc/nginx/sites-available/$site.conf /etc/nginx/sites-enabled/$site.conf
done
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```
After changing any file in `deploy/nginx/`, copy it again and run the last line.

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
Copy the resulting `dist/` to `/var/www/genex/frontend/dist` (the folder both
frontend sites serve, set in `snippets/genex-frontend-files.conf`). No Nginx
reload is needed: open tabs pick up the new build by themselves.

## After DNS is live

Once `gelearn.genextechnocrats.com` and `cms.genextechnocrats.com` actually
resolve to this server, everything works with no further code changes — the
same build already handles both hostnames, and the backend's
`CORS_ALLOWED_ORIGINS` (set in `.env` above) already expects both frontend
origins.

While the temporary pre-launch frontend is still on Vercel, this server's
backend needs `https://genextechnocrats.vercel.app` included in
`CORS_ALLOWED_ORIGINS` too — drop it once the real domains take over.

## Checking it works

From any machine, after deploying. Each command should print what its comment says:
```bash
# Redirects: http and www end up on https://genextechnocrats.com
curl -sI http://www.genextechnocrats.com/ | grep -i '^location'            # https://genextechnocrats.com/
# Pages: HTTP/2, never cached, security headers present
curl -sI https://genextechnocrats.com/ | grep -iE '^HTTP|cache-control|strict-transport|x-frame'
# Built JS: cached for a year and compressed
JS=$(curl -s https://genextechnocrats.com/ | grep -o '/assets/index-[^"]*\.js' | head -1)
curl -sI -H 'Accept-Encoding: gzip' https://genextechnocrats.com$JS | grep -iE 'cache-control|content-encoding'
# A missing file is a real 404, not the app
curl -s -o /dev/null -w '%{http_code}\n' https://genextechnocrats.com/assets/missing.js   # 404
# GeLearn has its own sitemap; old section URLs redirect
curl -s https://gelearn.genextechnocrats.com/robots.txt | grep -i sitemap                # gelearn…/sitemap.xml
curl -sI https://gelearn.genextechnocrats.com/technology | grep -i '^location'          # …/geacademy
# The API answers through Nginx
curl -s -o /dev/null -w '%{http_code}\n' https://cms.genextechnocrats.com/api/snippets/nav/   # 200
```

## Security policy (Content-Security-Policy)

`snippets/genex-frontend-headers.conf` lists where the frontend may load scripts,
fonts, images, video and API data from. It ships as
`Content-Security-Policy-Report-Only`: browsers report what it would block in the
DevTools console but block nothing. Before launch it was checked in Chrome against
the marketing home page, GeLearn home and a course page with no reports.

After a few weeks with no unexpected reports (open the site with DevTools'
console showing; reports start with "[Report Only]"), enforce it: rename the header
to `Content-Security-Policy` in that file, copy it to `/etc/nginx/snippets/` and
reload Nginx. If a new outside service is added later (another video host, a chat
widget), add its address to the matching line there first.
