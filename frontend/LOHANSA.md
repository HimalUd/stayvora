# Lohansa — Migration Steps

**Role:** User authentication, booking & cancellation, booking records, confirmations, testing.

> Complete steps **in order** — each step depends on the previous one.

---

## Step 1 — Auth Context

Depends on: Phase 1 (api.js, main.jsx)

```bash
cp "S/src/context/AuthContext.jsx" "D/src/context/AuthContext.jsx"
```

---

## Step 2 — Protected Route

Depends on: AuthContext (Step 1)

```bash
cp "S/src/components/ProtectedRoute/ProtectedRoute.jsx" "D/src/components/ProtectedRoute/ProtectedRoute.jsx"
```

---

## Step 3 — Shared Auth Styles

```bash
cp "S/src/styles/Auth.css" "D/src/styles/Auth.css"
```

---

## Step 4 — Login Page

Depends on: AuthContext, Auth.css

```bash
cp "S/src/pages/Login.jsx" "D/src/pages/Login.jsx"
cp "S/src/pages/Login.css" "D/src/pages/Login.css"
```

---

## Step 5 — Register Page

Depends on: AuthContext, Auth.css

```bash
cp "S/src/pages/Register.jsx" "D/src/pages/Register.jsx"
cp "S/src/pages/Register.css" "D/src/pages/Register.css"
```

---

## Step 6 — Booking Page

Depends on: AuthContext, api.js

```bash
cp "S/src/pages/Booking.jsx" "D/src/pages/Booking.jsx"
cp "S/src/pages/Booking.css" "D/src/pages/Booking.css"
```

---

## Step 7 — Confirmation Page

Depends on: nothing beyond Phase 1

```bash
cp "S/src/pages/Confirmation.jsx" "D/src/pages/Confirmation.jsx"
cp "S/src/pages/Confirmation.css" "D/src/pages/Confirmation.css"
```

---

## Step 8 — User Dashboard (Booking Records)

Depends on: AuthContext, api.js

```bash
cp "S/src/pages/Dashboard/UserDashboard.jsx" "D/src/pages/Dashboard/UserDashboard.jsx"
cp "S/src/pages/Dashboard/Dashboard.css" "D/src/pages/Dashboard/Dashboard.css"
```

---

## Step 9 — Testing

After all files are copied, verify:

- Login/logout flow with `demo@stayvora.com` / `demo123`
- Registration creates a user
- Booking flow: select hotel → choose room → fill form → confirmation code
- Booking records appear in user dashboard
- Protected routes redirect unauthenticated users to /login
