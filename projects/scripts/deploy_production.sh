#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="${APP_DIR:-/var/www/EXCELtoWORD/projects}"
cd "${APP_DIR}"

echo "[1/5] Enabling pnpm via corepack..."
corepack enable
corepack prepare pnpm@9.0.0 --activate

echo "[2/5] Installing Node dependencies..."
pnpm install --frozen-lockfile

echo "[3/5] Installing Python dependencies..."
python3 -m pip install -r requirements.txt

echo "[4/5] Building application..."
pnpm build

echo "[5/5] Restarting PM2 service..."
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save

echo "Deployment finished successfully."
