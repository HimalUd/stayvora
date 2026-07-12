# Isuru — Migration Steps

**Role:** Hotel & room management dashboard, room availability/pricing, hotel details, real-time updates (prevent double booking), testing.

> Complete steps **in order** — each step depends on the previous one.

---

## Step 1 — HotelCard Component

Depends on: Phase 1 (api.js)

```bash
cp "S/src/components/HotelCard/HotelCard.jsx" "D/src/components/HotelCard/HotelCard.jsx"
cp "S/src/components/HotelCard/HotelCard.css" "D/src/components/HotelCard/HotelCard.css"
```

---

## Step 2 — BookingForm Component

Depends on: api.js

```bash
cp "S/src/components/BookingForm/BookingForm.jsx" "D/src/components/BookingForm/BookingForm.jsx"
cp "S/src/components/BookingForm/BookingForm.css" "D/src/components/BookingForm/BookingForm.css"
```

---

## Step 3 — Hotel Detail Page

Depends on: HotelCard, BookingForm

```bash
cp "S/src/pages/HotelDetail.jsx" "D/src/pages/HotelDetail.jsx"
cp "S/src/pages/HotelDetail.css" "D/src/pages/HotelDetail.css"
```

---

## Step 4 — Hotel Owner Login

Depends on: api.js, AuthContext

```bash
cp "S/src/pages/HotelOwnerLogin.jsx" "D/src/pages/HotelOwnerLogin.jsx"
cp "S/src/pages/HotelOwnerLogin.css" "D/src/pages/HotelOwnerLogin.css"
```

---

## Step 5 — Hotel Owner Registration

Depends on: api.js

```bash
cp "S/src/pages/HotelOwnerRegister.jsx" "D/src/pages/HotelOwnerRegister.jsx"
cp "S/src/pages/HotelOwnerRegister.css" "D/src/pages/HotelOwnerRegister.css"
```

---

## Step 6 — Hotel Owner Portal (Landing)

Depends on: nothing beyond Phase 1

```bash
cp "S/src/pages/HotelOwnerPortal.jsx" "D/src/pages/HotelOwnerPortal.jsx"
cp "S/src/pages/HotelOwnerPortal.css" "D/src/pages/HotelOwnerPortal.css"
```

---

## Step 7 — Hotel Owner Dashboard

Depends on: api.js, AuthContext (owner role)

```bash
cp "S/src/pages/HotelOwnerDashboard.jsx" "D/src/pages/HotelOwnerDashboard.jsx"
cp "S/src/pages/HotelOwnerDashboard.css" "D/src/pages/HotelOwnerDashboard.css"
```

---

## Step 8 — Hotel Owner Booking Detail

Depends on: HotelOwnerDashboard

```bash
cp "S/src/pages/HotelOwnerBookingDetail.jsx" "D/src/pages/HotelOwnerBookingDetail.jsx"
cp "S/src/pages/HotelOwnerBookingDetail.css" "D/src/pages/HotelOwnerBookingDetail.css"
```

---

## Step 9 — Testing

- Register a hotel via Hotel Owner Register (4-step form)
- Log in as hotel owner
- View dashboard with booking stats
- Click a booking to see detail; test Check In / Check Out / Cancel
- Verify room pricing displays correctly on Hotel Detail page
- Confirm no double bookings possible (date validation in BookingForm)
