# Shashikala — Backend Migration Steps

**Role:** Admin & Configuration — admin dashboard API, app config, utilities, views.

> Complete steps **in order** — each step depends on the previous one.

---

## Step 1 — Config

Depends on: nothing (foundation)

```bash
cp "S/config/db.js" "D/config/db.js"
cp "S/config/app.js" "D/config/app.js"
```

---

## Step 2 — Utils

Depends on: nothing (shared helpers)

```bash
cp "S/utils/helpers.js" "D/utils/helpers.js"
cp "S/utils/seedData.js" "D/utils/seedData.js"
```

---

## Step 3 — Views (Email Templates)

Depends on: nothing (standalone)

```bash
cp -r "S/Views/" "D/Views/"
```

---

## Step 4 — Admin Controller & Routes

Depends on: Middleware (Lohansa), all Models

```bash
# Controllers
cp "S/Controllers/adminController.js" "D/Controllers/adminController.js"

# Routes
cp "S/api/admin/admin.js" "D/api/admin/admin.js"
```

---

## Step 5 — App Entry Point & Uploads

Depends on: everything above

```bash
cp "S/app.js" "D/app.js"
cp "S/package.json" "D/package.json"
cp -r "S/uploads/" "D/uploads/"
```

---

## Step 6 — Testing

- Admin dashboard endpoints return aggregated stats
- Admin can manage users, hotels, and bookings
- Email templates render correctly
- App configuration connects to database
- Seed data populates the database
- Run `npm start` and verify the server starts without errors
