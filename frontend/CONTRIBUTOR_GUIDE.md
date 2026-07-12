# StayVora Frontend — Migration Guide

## Overview

Migrate completed code from **Documents/stayvora/frontend** → **Desktop/stayvora/frontend**.

- **Source base:** `~/Documents/My Files/stayvora/frontend`
- **Destination base:** `~/Desktop/stayvora/frontend`

---

## Dependency Order (why this sequence)

1. **package.json** — needs `react-router-dom` + `axios` before anything else
2. **public/index.html** — standalone shell
3. **src/main.jsx** — app entry point (overwrites Vite template)
4. **src/utils/api.js** — shared API client, imported by almost every page
5. **src/context/AuthContext.jsx** — required by ProtectedRoute, Login, Navbar
6. **src/components/** — UI building blocks used by pages
7. **src/pages/** — final pages that compose everything

---

## Phase 1 — Foundation (anyone)

```bash
# 1. Update package.json — add react-router-dom and axios
# 2. npm install
# 3. Copy these files in order:

# Step 1 — Entry HTML
cp "Documents/.../public/index.html" "Desktop/.../public/index.html"

# Step 2 — Entry point (overwrites Vite main.jsx)
cp "Documents/.../src/index.js" "Desktop/.../src/main.jsx"

# Step 3 — Shared API client
cp "Documents/.../src/utils/api.js" "Desktop/.../src/utils/api.js"
```

---

## File Mapping Key

| Symbol | Meaning |
|--------|---------|
| `S` | `~/Documents/My Files/stayvora/frontend` |
| `D` | `~/Desktop/stayvora/frontend` |

All paths below are relative to `S` and `D`.
