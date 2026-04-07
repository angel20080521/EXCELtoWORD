#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"

cd "${COZE_WORKSPACE_PATH}"

echo "Installing dependencies..."
pnpm install --prefer-frozen-lockfile --prefer-offline --loglevel debug --reporter=append-only

echo "Installing Python dependencies..."
pip3 install -r requirements.txt || echo "Warning: Python dependencies installation failed, will try again at runtime"

echo "Building the Next.js project..."
pnpm next build

echo "Bundling server with tsup..."
pnpm tsup src/server.ts --format cjs --platform node --target node20 --outDir dist --no-splitting --no-minify

echo "Copying Python scripts to dist/scripts/..."
mkdir -p dist/scripts
cp -r scripts/*.py dist/scripts/

# 额外复制到 dist/ 根目录（兼容性更好）
cp scripts/process_excel_word.py dist/

echo "Copying requirements.txt to dist..."
cp requirements.txt dist/

echo "Copying public directory to dist..."
cp -r public dist/

echo "Verifying copied files..."
echo "=== dist/process_excel_word.py ==="
test -f dist/process_excel_word.py && echo "✓ Found (root level)" || echo "✗ Not found"
echo ""
echo "=== dist/scripts/process_excel_word.py ==="
test -f dist/scripts/process_excel_word.py && echo "✓ Found" || echo "✗ Not found"
echo ""
echo "=== dist/requirements.txt ==="
test -f dist/requirements.txt && echo "✓ Found" || echo "✗ Not found"
echo ""
echo "=== dist/public/ ==="
test -d dist/public && echo "✓ Found" || echo "✗ Not found"

echo "Build completed successfully!"
