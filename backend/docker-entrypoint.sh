#!/bin/sh
# Starting the web server refreshes the CMS/admin CSS and JS in the shared static
# volume (Nginx serves it). One-off commands (`docker compose run --rm backend
# python manage.py migrate`) skip that and run as given.
set -e

if [ "$1" = "gunicorn" ]; then
    python manage.py collectstatic --noinput --verbosity 0
fi

exec "$@"
