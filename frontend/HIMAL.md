# Himal — Migration Steps

**Role:** Tourist attractions & event integration, location-based hotel & travel search, system security & user experience, testing.

> Complete steps **in order** — each step depends on the previous one.

---

## Step 1 — SearchBar Component

Depends on: Phase 1 (api.js)

```bash
cp "S/src/components/SearchBar/SearchBar.jsx" "D/src/components/SearchBar/SearchBar.jsx"
cp "S/src/components/SearchBar/SearchBar.css" "D/src/components/SearchBar/SearchBar.css"
```

---

## Step 2 — FilterPanel Component

Depends on: api.js

```bash
cp "S/src/components/FilterPanel/FilterPanel.jsx" "D/src/components/FilterPanel/FilterPanel.jsx"
cp "S/src/components/FilterPanel/FilterPanel.css" "D/src/components/FilterPanel/FilterPanel.css"
```

---

## Step 3 — Landing Page (Destinations, Events, Search)

Depends on: Navbar (Shashikala), SearchBar

```bash
cp "S/src/pages/Landing.jsx" "D/src/pages/Landing.jsx"
cp "S/src/pages/Landing.css" "D/src/pages/Landing.css"
```

---

## Step 4 — Search Results Page (Location-based Search)

Depends on: FilterPanel, HotelCard (Isuru), api.js

```bash
cp "S/src/pages/SearchResults.jsx" "D/src/pages/SearchResults.jsx"
cp "S/src/pages/SearchResults.css" "D/src/pages/SearchResults.css"
```

---

## Step 5 — Global App CSS

Overwrites the Vite template styles with StayVora design system.

```bash
cp "S/src/App.css" "D/src/App.css"
```

---

## Step 6 — App.jsx (Route Definitions)

**Important:** This overwrites the entire route tree. Must be done last after all components/pages are in place.

```bash
cp "S/src/App.jsx" "D/src/App.jsx"
```

---

## Step 7 — Seed Data

Copy demo data files so the app works without a backend.

```bash
cp "S/public/seed.html" "D/public/seed.html"
cp "S/public/seed-dummy-data.js" "D/public/seed-dummy-data.js"
```

---

## Step 8 — Testing

- Landing page hero, destination cards, and CTA sections work
- Location-based search with filters returns results
- Search results page with sidebar filters works
- Attractions & events appear in search/filter
- Security: protected routes block unauthenticated access
- Responsive design and user experience across all pages
- Run `npm run build` and fix any import errors
