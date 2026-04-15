#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"

PORT=5000
DEPLOY_RUN_PORT="${DEPLOY_RUN_PORT:-$PORT}"
HOST="${HOST:-0.0.0.0}"
NODE_ENV="${NODE_ENV:-production}"
COZE_PROJECT_ENV="${COZE_PROJECT_ENV:-PROD}"


start_service() {
    cd "${COZE_WORKSPACE_PATH}"

    # 确保Python依赖已安装
    echo "Ensuring Python dependencies are installed..."
    pip3 install -q openpyxl==3.1.2 python-docx==1.1.0

    # 设置环境变量，确保应用能正确找到项目根目录
    export COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH}"
    export NODE_ENV="${NODE_ENV}"
    export COZE_PROJECT_ENV="${COZE_PROJECT_ENV}"
    export HOST="${HOST}"

    echo "Starting HTTP service on port ${DEPLOY_RUN_PORT} for deploy..."
    echo "Project root: ${COZE_WORKSPACE_PATH}"
    echo "Script path: ${COZE_WORKSPACE_PATH}/scripts/process_excel_word.py"
    echo "Runtime env: NODE_ENV=${NODE_ENV}, COZE_PROJECT_ENV=${COZE_PROJECT_ENV}, HOST=${HOST}"

    PORT=${DEPLOY_RUN_PORT} node dist/server.js
}

echo "Starting HTTP service on port ${DEPLOY_RUN_PORT} for deploy..."
start_service
