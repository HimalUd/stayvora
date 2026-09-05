# Hotels API

**Base URL:** `http://localhost/Backend/api/hotels`

---

## GET /list

List all active hotels.

**Authentication:** None (public)

**Query Parameters:**

| Parameter | Type   | Required | Description                          |
|-----------|--------|----------|--------------------------------------|
| search    | string | No       | Search by name or location (LIKE %) |

**Response 200:**
```json
{
  "hotels": [
    {
      "id": 1,
      "owner_id": 2,
      "name": "Grand Hotel",
      "description": "...",
      "location": "Paris",
      "address": "...",
      "city": "Paris",
      "country": "France",
      "price_range": "$$$",
      "rating": 4.5,
      "amenities": "WiFi, Pool",
      "travel_purpose": "leisure",
      "status": "active",
      "created_at": "2024-01-01 12:00:00",
      "owner_name": "Jane Owner",
      "min_room_price": "80.00",
      "image": "uploads/hotel1.jpg",
      "images": ["uploads/hotel1.jpg", "uploads/hotel2.jpg"]
    }
  ]
}
```

---

## GET /get

Get full details of a single hotel (rooms, events, offers, places, images).

**Authentication:** None (public)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id        | int  | Yes      | Hotel ID    |

**Response 200:**
```json
{
  "hotel": {
    "id": 1,
    "owner_id": 2,
    "name": "Grand Hotel",
    "description": "...",
    "location": "Paris",
    "address": "...",
    "city": "Paris",
    "country": "France",
    "price_range": "$$$",
    "rating": 4.5,
    "amenities": "WiFi, Pool",
    "travel_purpose": "leisure",
    "status": "active",
    "created_at": "2024-01-01 12:00:00",
    "owner_name": "Jane Owner",
    "owner_email": "jane@example.com",
    "rooms": [
      { "id": 1, "hotel_id": 1, "room_type": "Deluxe", "price": 150.00, "capacity": 2, "description": "...", "is_available": 1 }
    ],
    "events": [
      { "id": 1, "hotel_id": 1, "name": "Live Music", "description": "...", "event_date": "2024-06-15", "price": 20.00 }
    ],
    "offers": [
      { "id": 1, "hotel_id": 1, "name": "Summer Sale", "description": "...", "discount": 15, "valid_until": "2024-08-31", "created_at": "..." }
    ],
    "places": [
      { "id": 1, "hotel_id": 1, "name": "Eiffel Tower", "description": "...", "distance": "2.5 km", "category": "landmark" }
    ],
    "images": ["uploads/hotel1.jpg", "uploads/hotel2.jpg"]
  }
}
```

**Errors:** 400 (missing/invalid id), 404 (not found)

---

## POST /create

Create a new hotel.

**Authentication:** `owner` role required

**Request Body (JSON):**

| Parameter      | Type   | Required | Description |
|----------------|--------|----------|-------------|
| name           | string | Yes      | Hotel name  |
| description    | string | No       | Description |
| location       | string | No       | Location    |
| address        | string | No       | Address     |
| city           | string | No       | City        |
| country        | string | No       | Country     |
| price_range    | string | No       | e.g. $, $$, $$$ |
| rating         | float  | No       | Rating (default 0) |
| amenities      | string | No       | Comma-separated |
| travel_purpose | string | No       | e.g. leisure, business |

**Response 201:**
```json
{ "message": "Hotel created successfully", "hotel": { "...full hotel object..." } }
```

**Errors:** 401/403 (not owner), 422 (name required)

---

## PUT /update

Update a hotel (owner only).

**Authentication:** `owner` role required (must own the hotel)

**Request Body (JSON):**

| Parameter      | Type   | Required | Description |
|----------------|--------|----------|-------------|
| id             | int    | Yes      | Hotel ID    |
| name           | string | No       | Updated name |
| description    | string | No       | Updated desc |
| location       | string | No       | Updated location |
| address        | string | No       | Updated address |
| price_range    | string | No       | Updated price range |
| amenities      | string | No       | Updated amenities |
| travel_purpose | string | No       | Updated purpose |
| status         | string | No       | e.g. active, inactive |

**Response 200:**
```json
{ "message": "Hotel updated successfully", "hotel": { "...full hotel object..." } }
```

**Errors:** 400 (missing id), 403 (not owner), 404 (not found), 422 (no fields)

---

## DELETE /delete

Delete a hotel and all related data (rooms, bookings, events, offers, places, images).

**Authentication:** `owner` role required (must own the hotel)

**Request Body (JSON):**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id        | int  | Yes      | Hotel ID    |

**Response 200:**
```json
{ "message": "Hotel deleted successfully" }
```

**Errors:** 400 (missing id), 403 (not owner), 404 (not found), 500 (transaction failure)

---

## GET /search

Advanced hotel search with filters.

**Authentication:** None (public)

**Query Parameters:**

| Parameter      | Type   | Required | Description |
|----------------|--------|----------|-------------|
| location       | string | No       | Search name/location/address |
| check_in       | date   | No       | Check-in date (Y-m-d) |
| check_out      | date   | No       | Check-out date (Y-m-d, must be after check_in) |
| min_price      | float  | No       | Min room price |
| max_price      | float  | No       | Max room price |
| rating         | float  | No       | Min rating |
| travel_purpose | string | No       | Match travel purpose |
| event          | string | No       | Match event name |

**Response 200:**
```json
{ "hotels": [ { "...same as list response..." } ] }
```

---

## POST /add_image

Add an image to a hotel. Supports both **file upload** (multipart/form-data) and **URL** (application/json).

**Authentication:** `owner` role required (must own the hotel)

### Option 1: File Upload

Send as `multipart/form-data`:

| Field    | Type   | Required | Description                |
|----------|--------|----------|----------------------------|
| hotel_id | int    | Yes      | Hotel ID                   |
| image    | file   | Yes      | Image file (JPG/PNG/GIF/WEBP) |

### Option 2: Image URL

Send as `application/json`:

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| hotel_id  | int    | Yes      | Hotel ID    |
| image_url | string | Yes      | Image URL   |

**Response 201:**
```json
{ "message": "Image added successfully", "id": 5 }
```

**Errors:** 400 (missing hotel_id), 404 (not found/access denied), 422 (missing image_url or invalid file type), 500 (upload failure)

---

## GET /my

Get all hotels owned by the authenticated user.

**Authentication:** `owner` role required

**Response 200:**
```json
{
  "hotels": [
    {
      "id": 1,
      "owner_id": 2,
      "name": "Grand Hotel",
      "description": "...",
      "location": "Paris",
      "address": "...",
      "city": "Paris",
      "country": "France",
      "price_range": "$$$",
      "rating": 4.5,
      "amenities": "WiFi, Pool",
      "travel_purpose": "leisure",
      "status": "active",
      "created_at": "2024-01-01 12:00:00",
      "min_room_price": "80.00",
      "images": [
        { "id": 1, "image_url": "uploads/hotel1.jpg" },
        { "id": 2, "image_url": "uploads/hotel2.jpg" }
      ]
    }
  ]
}
```

**Errors:** 401/403 (not owner)

---

## DELETE /delete_image

Delete a hotel image.

**Authentication:** `owner` role required (must own the hotel)

**Request Body (JSON):**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id        | int  | Yes      | Image ID (from hotel_images table) |

**Response 200:**
```json
{ "message": "Image deleted successfully" }
```

**Errors:** 400 (missing image ID), 403 (not owner), 404 (not found)

---

## POST /add_amenity

Add a single amenity to a hotel's comma-separated `amenities` field (idempotent - no duplicate added).

**Authentication:** `owner` role required (must own the hotel)

**Request Body (JSON):**

| Parameter | Type   | Required | Description     |
|-----------|--------|----------|-----------------|
| hotel_id  | int    | Yes      | Hotel ID        |
| amenity   | string | Yes      | Amenity name, e.g. "Pool" |

**Response 200:**
```json
{ "message": "Amenity added successfully", "hotel": { "...full hotel object with updated amenities..." } }
```

**Errors:** 400 (missing/invalid hotel_id), 422 (empty amenity), 403 (not owner), 404 (not found)

---

## POST /delete_amenity

Remove a single amenity from a hotel's `amenities` field.

**Authentication:** `owner` role required (must own the hotel)

**Request Body (JSON):**

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| hotel_id  | int    | Yes      | Hotel ID    |
| amenity   | string | Yes      | Amenity name to remove |

**Response 200:**
```json
{ "message": "Amenity removed successfully", "hotel": { ...full hotel object with updated amenities... } }
```

**Errors:** 400 (missing/invalid hotel_id), 422 (empty amenity), 403 (not owner), 404 (not found)
