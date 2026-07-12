# Himal — Backend Migration Steps

**Role:** Places, Events & Offers — location-based content and promotions.

> Complete steps **in order** — each step depends on the previous one.

---

## Step 1 — Places API

Depends on: config, Models, Controllers

```bash
# Models
cp "S/Models/Place.js" "D/Models/Place.js"

# Controllers
cp "S/Controllers/placeController.js" "D/Controllers/placeController.js"

# Routes
cp "S/api/places/places.js" "D/api/places/places.js"
cp "S/api/places/places.json" "D/api/places/places.json"
```

---

## Step 2 — Events API

Depends on: config, Models, Controllers

```bash
# Models
cp "S/Models/Event.js" "D/Models/Event.js"

# Controllers
cp "S/Controllers/eventController.js" "D/Controllers/eventController.js"

# Routes
cp "S/api/events/events.js" "D/api/events/events.js"
cp "S/api/events/events.json" "D/api/events/events.json"
```

---

## Step 3 — Offers API

Depends on: config, Models, Controllers

```bash
# Models
cp "S/Models/Offer.js" "D/Models/Offer.js"

# Controllers
cp "S/Controllers/offerController.js" "D/Controllers/offerController.js"

# Routes
cp "S/api/offers/offers.js" "D/api/offers/offers.js"
cp "S/api/offers/offers.json" "D/api/offers/offers.json"
```

---

## Step 4 — Testing

- All places, events, and offer endpoints return correct data
- Location-based filtering works on places
- CRUD operations for all three resources
- Error handling returns appropriate status codes
- Run `npm start` and verify with Postman or browser
