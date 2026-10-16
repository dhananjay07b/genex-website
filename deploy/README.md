# Deploying to the server (Docker)

The whole server runs from [`docker-compose.yml`](../docker-compose.yml) at the repo
root. Local development is unchanged: `npm run dev` + `manage.py runserver`, with
`?shell=gelearn` / `?shell=marketing` to switch sites (see `frontend/src/lib/host.ts`).

## What runs where

| Hostname (test, now) | Hostname (live, later) | Serves |
|---|---|---|
| `test.genextechnocrats.com` | `genextechnocrats.com` (`www.` redirects) | Marketing site |
| `test-gelearn.genextechnocrats.com` | `gelearn.genextechnocrats.com` | GeLearn |
| `cms.genextechnocrats.com` | same | API, Wagtail CMS, Django admin |

The main addresses on the CMS host:
- **`https://cms.genextechnocrats.com/admin/`:** the Wagtail CMS. Superusers only.
- **`https://cms.genextechnocrats.com/dj-admin/`:** the Django admin, for users, companies and enquiries. Superusers only.
- **`https://cms.genextechnocrats.com/api/…`:** the REST API used by both sites.

Locally those admins stay at `localhost:8000/cms/` and `localhost:8000/admin/`. The
paths come from `WAGTAIL_ADMIN_PATH` and `DJANGO_ADMIN_PATH` in `backend/genex/settings/`.

Three containers:

| Service | What it is | Data |
|---|---|---|
| `nginx` | Built frontend + Nginx. Takes ports 80/443, serves both frontend hostnames and proxies the CMS hostname to the backend | none (certificates mounted read-only from the host) |
| `backend` | Django/Wagtail on gunicorn | `media` volume (uploads), `static` volume (CMS CSS/JS) |
| `db` | PostgreSQL 16, reachable only by the backend | `pgdata` volume |

**One frontend build serves both sites.** The app picks marketing or GeLearn from the
hostname, comparing it with the GeLearn address it was built with.

Configuration lives in two files on the server, both outside git:

| File | Template | Holds |
|---|---|---|
| `.env` (next to `docker-compose.yml`) | [`compose.env.example`](compose.env.example) | hostnames, `SEO_MODE`, database password, Google client ID, restart policy |
| `backend/.env.production` | [`backend.env.example`](backend.env.example) | secrets only: Django key, SMTP, Google client secret |

Everything that follows from the hostnames is derived in `docker-compose.yml`:
allowed hosts, CORS, email links, the frontend's API address and the cookie domain.

## 1. One-time server setup (Ubuntu 24.04 on EC2)

1. **Install Docker.** Install Docker Engine and the Compose plugin from Docker's own
   apt repository (https://docs.docker.com/engine/install/ubuntu/), then allow your
   user to run it:
   ```bash
   sudo usermod -aG docker $USER   # log out and back in
   ```
2. **Install certbot:**
   ```bash
   sudo apt install certbot
   ```
3. **Security group.** Open ports 22, 80 and 443 only. The database has no published
   port; never open 5432.
4. **Memory.** The frontend build needs about 2 GB of RAM. On a small instance, add swap first:
   ```bash
   sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
   ```
5. **Get the code:**
   ```bash
   sudo mkdir -p /srv/genex && sudo chown $USER /srv/genex
   git clone <repo url> /srv/genex && cd /srv/genex
   ```

## 2. DNS

Point A records for `test.genextechnocrats.com`, `test-gelearn.genextechnocrats.com`
and `cms.genextechnocrats.com` at the server's Elastic IP. Wait until they resolve
(`dig +short test.genextechnocrats.com`) before getting the certificate.

## 3. Configuration

```bash
cd /srv/genex
cp deploy/compose.env.example .env
cp deploy/backend.env.example backend/.env.production
chmod 600 .env backend/.env.production
```
Fill both in: see the comments in each file. Generate the secrets with:
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(64))"
```
Use one for `DJANGO_SECRET_KEY` and a second one for `POSTGRES_PASSWORD`.

## 4. HTTPS certificate

Get one certificate for all three hostnames. Certbot briefly runs its own web server
on port 80, so Nginx is stopped around each renewal. That's about 10 seconds of
downtime every two months. Certbot saves the hooks and its timer renews automatically.
```bash
sudo certbot certonly --standalone --cert-name genex \
    -d test.genextechnocrats.com -d test-gelearn.genextechnocrats.com -d cms.genextechnocrats.com \
    --pre-hook "docker compose -f /srv/genex/docker-compose.yml stop nginx" \
    --post-hook "docker compose -f /srv/genex/docker-compose.yml start nginx"
sudo certbot renew --dry-run   # checks that renewal will work
```

## 5. First start, with the local data

Start the database on its own:
```bash
cd /srv/genex
docker compose build          # first build takes a few minutes
docker compose up -d --wait db   # waits until the database is ready
```

**Copy the local data in** (once, at launch). Do this before `migrate`, into the new
empty database. On the development machine:
```bash
pg_dump -h 127.0.0.1 -U genex -d genex -Fc > genex.dump   # asks for the genex password
tar czf genex-media.tgz -C backend media                  # uploaded images and documents
scp genex.dump genex-media.tgz <user>@<server>:/tmp/
```
On the server:
```bash
cd /srv/genex
docker compose exec -T db pg_restore --no-owner -U genex -d genex < /tmp/genex.dump
docker compose run --rm -T --no-deps --entrypoint tar backend xzf - -C /app < /tmp/genex-media.tgz
```

Then bring everything up:
```bash
docker compose run --rm backend python manage.py migrate
docker compose up -d
# Resized copies of uploaded images (what the API serves); re-run after restoring media
docker compose exec backend python manage.py warm_image_renditions
docker compose ps             # all three "Up", backend and db "(healthy)"
```

If you're starting with an empty database instead, run `migrate` as above, then:
```bash
docker compose exec backend python manage.py createsuperuser
```

### Settings outside the server (once)
- **Wagtail:** in the CMS at `https://cms.genextechnocrats.com/admin/`, go to Settings → Sites
  and set the hostname to `cms.genextechnocrats.com`, port 443.
- **Google Cloud Console:** on the OAuth client, under Authorized JavaScript origins,
  add `https://test-gelearn.genextechnocrats.com` and `https://test.genextechnocrats.com`.
- **Email (Hostinger DNS):** check that SPF, DKIM and DMARC are set for
  `genextechnocrats.com`, then send a test:
  ```bash
  docker compose exec backend python manage.py send_test_email you@example.com
  ```

## 6. Deploying an update

```bash
cd /srv/genex
git pull
docker compose build
docker compose run --rm backend python manage.py migrate
docker compose up -d          # recreates only the containers whose image changed
```
- **A frontend change** rebuilds the `nginx` image. Open tabs pick up the new build by themselves.
- **A backend change** rebuilds `backend`, and its start refreshes the CMS static files.
- **Clearing out old images now and then:** `docker image prune -f`.

## 7. Day-to-day

```bash
docker compose ps                         # what's running
docker compose logs -f --tail 100 backend # or nginx, db
docker compose restart backend
docker compose exec backend python manage.py <command>
```
With `RESTART_POLICY=unless-stopped` in `.env`, the containers come back by themselves
after a crash or a reboot.

## 8. Backups

A nightly database dump and media archive, keeping 14 days:
```bash
sudo install -d -m 700 /var/backups/genex
sudo tee /etc/cron.d/genex-backup > /dev/null <<'EOF'
30 2 * * * root cd /srv/genex && docker compose exec -T db pg_dump -U genex -Fc genex > /var/backups/genex/genex-$(date +\%F).dump && docker compose exec -T backend tar czf - -C /app media > /var/backups/genex/media-$(date +\%F).tgz && find /var/backups/genex -type f -mtime +14 -delete
EOF
```
**Also copy these off the server**, for example to S3. A backup on the same disk
doesn't survive losing the instance.

To restore a database dump:
```bash
docker compose stop backend
docker compose exec -T db pg_restore --clean --if-exists --no-owner -U genex -d genex < /var/backups/genex/genex-YYYY-MM-DD.dump
docker compose start backend
```
To restore media, run the `tar xzf` command from section 5 with the media archive.

## 9. Checking it works

From any machine. Each command should print what its comment says:
```bash
# Redirects: http ends up on https
curl -sI http://test.genextechnocrats.com/ | grep -i '^location'                 # https://test.genextechnocrats.com/
# Pages: HTTP/2, security headers, and (test sites) noindex
curl -sI https://test.genextechnocrats.com/ | grep -iE '^HTTP|strict-transport|x-robots'
# Test sites are hidden from search engines
curl -s https://test-gelearn.genextechnocrats.com/robots.txt                      # Disallow: /
# Built JS: cached for a year and compressed
JS=$(curl -s https://test.genextechnocrats.com/ | grep -o '/assets/index-[^"]*\.js' | head -1)
curl -sI -H 'Accept-Encoding: gzip' https://test.genextechnocrats.com$JS | grep -iE 'cache-control|content-encoding'
# A missing file is a real 404, not the app
curl -s -o /dev/null -w '%{http_code}\n' https://test.genextechnocrats.com/assets/missing.js     # 404
# Old GeLearn section URLs redirect
curl -sI https://test-gelearn.genextechnocrats.com/technology | grep -i '^location'   # …/geacademy
# The API and the admins answer
curl -s -o /dev/null -w '%{http_code}\n' https://cms.genextechnocrats.com/api/snippets/nav/   # 200
curl -sI https://cms.genextechnocrats.com/admin/ | grep -i '^location'              # …/admin/login/…
curl -sI https://cms.genextechnocrats.com/dj-admin/ | grep -i '^location'           # …/dj-admin/login/…
```
In a browser:
- `test-gelearn.` shows GeLearn and `test.` shows the marketing site.
- Signing in on GeLearn works.
- A verification email's link goes to `test-gelearn.`.

## 10. Going live

This is the same stack and the same database, with new hostnames. No code changes.

1. **DNS:** point `genextechnocrats.com`, `www.genextechnocrats.com` and
   `gelearn.genextechnocrats.com` at the server.
2. **Certificate:** add the new names. `--expand` keeps the test names. Drop them later
   by re-running with only the names you want.
   ```bash
   sudo certbot certonly --standalone --cert-name genex --expand \
       -d test.genextechnocrats.com -d test-gelearn.genextechnocrats.com -d cms.genextechnocrats.com \
       -d genextechnocrats.com -d www.genextechnocrats.com -d gelearn.genextechnocrats.com
   ```
3. **`.env`:** set `MARKETING_HOST=genextechnocrats.com`,
   `GELEARN_HOST=gelearn.genextechnocrats.com` and `SEO_MODE=indexable`.
4. **Rebuild and restart:** the hostnames are built into the frontend.
   ```bash
   docker compose build && docker compose up -d
   ```
5. **Google Cloud Console:** add the live origins.
6. **Optional:** to keep old test links working, add a small Nginx server block that
   redirects the test hostnames to the live ones.

## Security policy (Content-Security-Policy)

The template [`docker/nginx/templates/snippets/genex-frontend-headers.snippet.template`](../docker/nginx/templates/snippets/genex-frontend-headers.snippet.template)
lists where the frontend may load scripts, fonts, images, video and API data from.

It ships as `Content-Security-Policy-Report-Only`: browsers report what it would block
in the DevTools console but block nothing. Before launch it was checked in Chrome
against the marketing home page, GeLearn home and a course page, with no reports.

**When to enforce it:** after a few weeks with no unexpected reports. To check, open the
site with DevTools' console showing; reports start with "[Report Only]". Then rename the
header to `Content-Security-Policy` in that file and run
`docker compose build nginx && docker compose up -d`.

**Adding an outside service later** (another video host, a chat widget): add its address
to the matching line there first.
