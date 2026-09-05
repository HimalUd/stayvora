#!/usr/bin/env bash
# Ensure the StayVora environment is ready for the frontend:
#   1. Creates/imports the MySQL database (if missing)
#   2. Starts the PHP backend on :8090 with the index.php router
#      (so /api/* and /uploads/* are served correctly)
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"
HOST=localhost
PORT=8090

command -v php >/dev/null 2>&1 || { echo "[stayvora] PHP is required but not installed."; exit 1; }
if ! command -v mysql >/dev/null 2>&1; then
  echo "[stayvora] MySQL client not found. Start MySQL (or XAMPP/MAMP) and ensure 'mysql' is on your PATH."
  exit 1
fi

# --- 1. Frontend dependencies -------------------------------------------------
if [ ! -x "$FRONTEND/node_modules/.bin/react-scripts" ]; then
  echo "[stayvora] Installing frontend dependencies (first run)..."
  (cd "$FRONTEND" && npm install)
fi

# --- 2. Database ---------------------------------------------------------------
if ! mysql -u root -e "SELECT 1" >/dev/null 2>&1; then
  echo "[stayvora] Could not connect to MySQL as root with no password."
  echo "[stayvora] Adjust backend/config/database.php to match your credentials,"
  echo "[stayvora] or set one up manually:  mysql -u root < backend/schema.sql"
  exit 1
fi

if mysql -u root -e "USE stayvora; SHOW TABLES LIKE 'users';" 2>/dev/null | grep -q users; then
  echo "[stayvora] Database 'stayvora' is ready."
else
  echo "[stayvora] Creating database 'stayvora' and importing schema.sql..."
  mysql -u root < "$BACKEND/schema.sql"
  echo "[stayvora] Database ready. Seed login: admin@stayvora.com / password"
fi

# --- 3. Backend ----------------------------------------------------------------
backendHealthy() {
  body="$(curl -s --max-time 2 "http://$HOST:$PORT/api/auth/check_session" 2>/dev/null)"
  [ -n "$body" ] && ! echo "$body" | grep -q '<!DOCTYPE'
}

if backendHealthy; then
  echo "[stayvora] Backend already running on http://$HOST:$PORT"
  exit 0
fi

echo "[stayvora] Starting backend on http://$HOST:$PORT ..."
cd "$BACKEND"
php -S "$HOST:$PORT" index.php > /tmp/stayvora-backend.log 2>&1 &
sleep 2

if backendHealthy; then
  echo "[stayvora] Backend is running (log: /tmp/stayvora-backend.log)."
else
  echo "[stayvora] Backend failed to start. See /tmp/stayvora-backend.log"
  exit 1
fi