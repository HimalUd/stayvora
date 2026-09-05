#!/usr/bin/env bash
# One-command startup for StayVora:
#   - ensures MySQL database is ready
#   - starts the PHP backend (:8090) with the index.php router
#   - installs frontend deps if needed and starts the React app (:3000)
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
FRONTEND="$ROOT/frontend"

bash "$ROOT/scripts/bootstrap-backend.sh"

echo "==> Starting frontend on http://localhost:3000"
cd "$FRONTEND"
npm start