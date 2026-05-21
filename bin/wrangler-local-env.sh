#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
STATE_DIR="${ROOT_DIR}/.wrangler-local"

mkdir -p \
  "${STATE_DIR}/config" \
  "${STATE_DIR}/cache" \
  "${STATE_DIR}/data" \
  "${STATE_DIR}/state" \
  "${STATE_DIR}/logs" \
  "${STATE_DIR}/registry"

export XDG_CONFIG_HOME="${XDG_CONFIG_HOME:-${STATE_DIR}/config}"
export XDG_CACHE_HOME="${XDG_CACHE_HOME:-${STATE_DIR}/cache}"
export XDG_DATA_HOME="${XDG_DATA_HOME:-${STATE_DIR}/data}"
export XDG_STATE_HOME="${XDG_STATE_HOME:-${STATE_DIR}/state}"
export WRANGLER_LOG_PATH="${WRANGLER_LOG_PATH:-${STATE_DIR}/logs}"
export WRANGLER_REGISTRY_PATH="${WRANGLER_REGISTRY_PATH:-${STATE_DIR}/registry}"
