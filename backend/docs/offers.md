# Special Offers API

**Base URL:** `http://localhost:8090/api/offers`

---

## GET /list

List all active special offers for a hotel (valid_until is NULL or future date).

**Authentication:** None (public)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| hotel_id  | int  | Yes      | Hotel ID    |

**Response 200:**
```json
{
  "offers": [
    {
      "id": 1,
      "hotel_id": 1,
      "name": "Summer Special",
      "description": "15% off on all bookings",
      "discount": 15,
      "valid_until": "2024-08-31",
      "created_at": "2024-06-01 12:00:00"
    }
  ]
}
```

**Errors:** 400 (missing/invalid hotel_id)

---

## POST /create

Create a special offer for a hotel.

**Authentication:** `owner` role required (must own the hotel)

**Request Body (JSON):**

| Parameter   | Type   | Required | Description        |
|-------------|--------|----------|--------------------|
| hotel_id    | int    | Yes      | Hotel ID           |
| name        | string | Yes      | Offer name         |
| description | string | No       | Offer description  |
| discount    | float  | No       | Discount percentage/value |
| valid_until | date   | No       | Expiry date (Y-m-d) |

**Response 201:**
```json
{ "message": "Offer created successfully", "offer": { "...full offer object..." } }
```

**Errors:** 401/403 (not owner), 404 (hotel not found), 422 (validation)

---

## PUT /update

Update a special offer.

**Authentication:** `owner` role required (must own the hotel)

**Request Body (JSON):**

| Parameter   | Type   | Required | Description        |
|-------------|--------|----------|--------------------|
| id          | int    | Yes      | Offer ID           |
| name        | string | No       | Updated name       |
| description | string | No       | Updated description |
| discount    | float  | No       | Updated discount   |
| valid_until | date   | No       | Updated expiry     |

**Response 200:**
```json
{ "message": "Offer updated successfully", "offer": { "...full offer object..." } }
```

**Errors:** 400 (missing id), 403 (not owner), 404 (not found), 422 (no fields)

---

## DELETE /delete

Delete a special offer.

**Authentication:** `owner` role required (must own the hotel)

**Request Body (JSON):**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id        | int  | Yes      | Offer ID    |

**Response 200:**
```json
{ "message": "Offer deleted successfully" }
```

**Errors:** 400 (missing id), 403 (not owner), 404 (not found)
