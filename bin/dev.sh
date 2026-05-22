#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "${ROOT_DIR}"

source ./bin/wrangler-local-env.sh

printf 'Bootstrapping local D1 schema...\n'
pnpm exec wrangler d1 migrations apply DB --local

exec pnpm exec astro dev "$@"
