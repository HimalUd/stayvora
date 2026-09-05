# Events API

**Base URL:** `http://localhost/Backend/api/events`

---

## GET /list

List all events for a hotel.

**Authentication:** None (public)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| hotel_id  | int  | Yes      | Hotel ID    |

**Response 200:**
```json
{
  "events": [
    {
      "id": 1,
      "hotel_id": 1,
      "name": "Live Music Night",
      "description": "Live band performance",
      "event_date": "2024-07-15",
      "price": 25.00
    }
  ]
}
```

**Errors:** 400 (missing/invalid hotel_id)

---

## POST /create

Create an event for a hotel.

**Authentication:** `owner` role required (must own the hotel)

**Request Body (JSON):**

| Parameter   | Type   | Required | Description      |
|-------------|--------|----------|------------------|
| hotel_id    | int    | Yes      | Hotel ID         |
| name        | string | Yes      | Event name       |
| description | string | No       | Event description |
| event_date  | date   | No       | Event date (Y-m-d) |
| price       | float  | No       | Event price      |

**Response 201:**
```json
{ "message": "Event created successfully", "event": { "...full event object..." } }
```

**Errors:** 401/403 (not owner), 404 (hotel not found), 422 (validation)

---

## PUT /update

Update an event.

**Authentication:** `owner` role required (must own the hotel)

**Request Body (JSON):**

| Parameter   | Type   | Required | Description        |
|-------------|--------|----------|--------------------|
| id          | int    | Yes      | Event ID           |
| name        | string | No       | Updated name       |
| description | string | No       | Updated description |
| event_date  | date   | No       | Updated date       |
| price       | float  | No       | Updated price      |

**Response 200:**
```json
{ "message": "Event updated successfully", "event": { "...full event object..." } }
```

**Errors:** 400 (missing id), 403 (not owner), 404 (not found), 422 (no fields)

---

## DELETE /delete

Delete an event.

**Authentication:** `owner` role required (must own the hotel)

**Request Body (JSON):**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id        | int  | Yes      | Event ID    |

**Response 200:**
```json
{ "message": "Event deleted successfully" }
```

**Errors:** 400 (missing id), 403 (not owner), 404 (not found)
