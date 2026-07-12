# Shashikala — Migration Steps

**Role:** Admin dashboard, customer accounts & booking management, trip planning support (attractions & events), testing.

> Complete steps **in order** — each step depends on the previous one.

---

## Step 1 — Navbar Component

Depends on: AuthContext (from Lohansa Phase 2)

```bash
cp "S/src/components/Navbar/Navbar.jsx" "D/src/components/Navbar/Navbar.jsx"
cp "S/src/components/Navbar/Navbar.css" "D/src/components/Navbar/Navbar.css"
```

---

## Step 2 — Footer Component

Depends on: nothing beyond Phase 1

```bash
cp "S/src/components/Footer/Footer.jsx" "D/src/components/Footer/Footer.jsx"
cp "S/src/components/Footer/Footer.css" "D/src/components/Footer/Footer.css"
```

---

## Step 3 — Home Page (Dashboard + Trip Planning)

Depends on: Navbar, Footer, AuthContext, api.js, SearchBar (Himal)

```bash
cp "S/src/pages/Home.jsx" "D/src/pages/Home.jsx"
cp "S/src/pages/Home.css" "D/src/pages/Home.css"
```

---

## Step 4 — About Page

```bash
cp "S/src/pages/About.jsx" "D/src/pages/About.jsx"
cp "S/src/pages/About.css" "D/src/pages/About.css"
```

---

## Step 5 — Contact Us Page

```bash
cp "S/src/pages/ContactUs.jsx" "D/src/pages/ContactUs.jsx"
cp "S/src/pages/ContactUs.css" "D/src/pages/ContactUs.css"
```

---

## Step 6 — Admin Dashboard

Depends on: AuthContext (admin role), api.js

```bash
cp "S/src/pages/AdminDashboard.jsx" "D/src/pages/AdminDashboard.jsx"
cp "S/src/pages/AdminDashboard.css" "D/src/pages/AdminDashboard.css"
```

---

## Step 7 — Testing

- Log in as admin (`admin@stayeasy.com` / `admin123`)
- Verify admin dashboard loads with stats, hotels, reviews
- Test hotel search/filter within admin panel
- Test review flagging and deletion
- Verify About and Contact pages render correctly
- Check trip planning section (attractions & events)
