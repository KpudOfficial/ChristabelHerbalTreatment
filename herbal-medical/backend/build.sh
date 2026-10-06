#!/usr/bin/env bash
# Build script for Render/Railway deployment
set -e

echo "==> Installing dependencies..."
pip install -r requirements.txt

echo "==> Running migrations..."
python manage.py migrate --noinput

echo "==> Collecting static files..."
python manage.py collectstatic --noinput

echo "==> Build complete."
