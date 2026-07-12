# Lohansa — Backend Migration Steps

**Role:** Auth & Bookings — user authentication, booking management, cancellation.

> Complete steps **in order** — each step depends on the previous one.

---

## Step 1 — User Model

Depends on: config

```bash
cp "S/Models/User.js" "D/Models/User.js"
```

---

## Step 2 — Booking Model

Depends on: config

```bash
cp "S/Models/Booking.js" "D/Models/Booking.js"
```

---

## Step 3 — Middleware

Depends on: User model

```bash
cp "S/Middleware/auth.js" "D/Middleware/auth.js"
cp "S/Middleware/errorHandler.js" "D/Middleware/errorHandler.js"
cp "S/Middleware/validation.js" "D/Middleware/validation.js"
```

---

## Step 4 — Auth Controller & Routes

Depends on: User model, Middleware

```bash
# Controllers
cp "S/Controllers/authController.js" "D/Controllers/authController.js"

# Routes
cp "S/api/auth/auth.js" "D/api/auth/auth.js"
```

---

## Step 5 — Booking Controller & Routes

Depends on: Booking model, Middleware, Room model (Isuru)

```bash
# Controllers
cp "S/Controllers/bookingController.js" "D/Controllers/bookingController.js"

# Routes
cp "S/api/bookings/bookings.js" "D/api/bookings/bookings.js"
```

---

## Step 6 — Testing

- User registration and login return JWT tokens
- Protected routes reject unauthenticated requests
- Role-based access control (user vs admin)
- Booking creation, retrieval, and cancellation work
- Booking prevents double-booking on same room/date
- Run `npm start` and verify with Postman or browser
