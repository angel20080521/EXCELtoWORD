#!/bin/bash
set -Eeuo pipefail


PORT=5000
COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"
DEPLOY_RUN_PORT=5000
HOST="${HOST:-0.0.0.0}"
COZE_PROJECT_ENV="${COZE_PROJECT_ENV:-DEV}"


cd "${COZE_WORKSPACE_PATH}"

kill_port_if_listening() {
    local pids
    pids=$(ss -H -lntp 2>/dev/null | awk -v port="${DEPLOY_RUN_PORT}" '$4 ~ ":"port"$"' | grep -o 'pid=[0-9]*' | cut -d= -f2 | paste -sd' ' - || true)
    if [[ -z "${pids}" ]]; then
      echo "Port ${DEPLOY_RUN_PORT} is free."
      return
    fi
    echo "Port ${DEPLOY_RUN_PORT} in use by PIDs: ${pids} (SIGKILL)"
    echo "${pids}" | xargs -I {} kill -9 {}
    sleep 1
    pids=$(ss -H -lntp 2>/dev/null | awk -v port="${DEPLOY_RUN_PORT}" '$4 ~ ":"port"$"' | grep -o 'pid=[0-9]*' | cut -d= -f2 | paste -sd' ' - || true)
    if [[ -n "${pids}" ]]; then
      echo "Warning: port ${DEPLOY_RUN_PORT} still busy after SIGKILL, PIDs: ${pids}"
    else
      echo "Port ${DEPLOY_RUN_PORT} cleared."
    fi
}

echo "Clearing port ${PORT} before start."
kill_port_if_listening

# 确保Python依赖已安装
echo "Ensuring Python dependencies are installed..."
pip3 install -q openpyxl==3.1.2 python-docx==1.1.0

# 设置环境变量，确保应用能正确找到项目根目录
export COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH}"
export HOST="${HOST}"
export COZE_PROJECT_ENV="${COZE_PROJECT_ENV}"

echo "Starting HTTP service on port ${PORT} for dev..."
echo "Project root: ${COZE_WORKSPACE_PATH}"
echo "Runtime env: COZE_PROJECT_ENV=${COZE_PROJECT_ENV}, HOST=${HOST}"

PORT=$PORT pnpm tsx watch src/server.ts
