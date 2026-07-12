# Isuru — Backend Migration Steps

**Role:** Hotels & Rooms — hotel listings, room availability, pricing, and double-booking prevention.

> Complete steps **in order** — each step depends on the previous one.

---

## Step 1 — Hotel Model & Controller

Depends on: config, Models

```bash
# Models
cp "S/Models/Hotel.js" "D/Models/Hotel.js"

# Controllers
cp "S/Controllers/hotelController.js" "D/Controllers/hotelController.js"
```

---

## Step 2 — Hotels API Routes

Depends on: Hotel model & controller

```bash
cp "S/api/hotels/hotels.js" "D/api/hotels/hotels.js"
cp "S/api/hotels/hotels.json" "D/api/hotels/hotels.json"
```

---

## Step 3 — Room Model & Controller

Depends on: config, Models

```bash
# Models
cp "S/Models/Room.js" "D/Models/Room.js"

# Controllers
cp "S/Controllers/roomController.js" "D/Controllers/roomController.js"
```

---

## Step 4 — Rooms API Routes

Depends on: Room model & controller

```bash
cp "S/api/rooms/rooms.js" "D/api/rooms/rooms.js"
cp "S/api/rooms/rooms.json" "D/api/rooms/rooms.json"
```

---

## Step 5 — Testing

- Hotel CRUD endpoints work correctly
- Room CRUD endpoints work correctly
- Room availability by date range returns accurate results
- No double bookings possible (server-side validation)
- Hotel listing includes room count and price range
- Run `npm start` and verify with Postman or browser
