# Rooms API

**Base URL:** `http://localhost/Backend/api/rooms`

---

## GET /list

List all rooms for a hotel.

**Authentication:** None (public)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| hotel_id  | int  | Yes      | Hotel ID    |

**Response 200:**
```json
{
  "rooms": [
    {
      "id": 1,
      "hotel_id": 1,
      "room_type": "Deluxe",
      "price": 150.00,
      "capacity": 2,
      "description": "Spacious room with sea view",
      "is_available": 1
    }
  ]
}
```

**Errors:** 400 (missing/invalid hotel_id)

---

## POST /create

Create a room in a hotel.

**Authentication:** `owner` role required (must own the hotel)

**Request Body (JSON):**

| Parameter   | Type   | Required | Description              |
|-------------|--------|----------|--------------------------|
| hotel_id    | int    | Yes      | Hotel ID                 |
| room_type   | string | Yes      | e.g. Deluxe, Standard    |
| price       | float  | Yes      | Price per night (> 0)   |
| capacity    | int    | No       | Max guests (default 2)   |
| description | string | No       | Room description         |

**Response 201:**
```json
{ "message": "Room created successfully", "room": { "...full room object..." } }
```

**Errors:** 401/403 (not owner), 404 (hotel not found), 422 (validation)

---

## PUT /update

Update a room.

**Authentication:** `owner` role required (must own the hotel)

**Request Body (JSON):**

| Parameter    | Type    | Required | Description           |
|--------------|---------|----------|-----------------------|
| id           | int     | Yes      | Room ID              |
| room_type    | string  | No       | Updated type         |
| price        | float   | No       | Updated price        |
| capacity     | int     | No       | Updated capacity     |
| description  | string  | No       | Updated description  |
| is_available | boolean | No       | 0 or 1               |

**Response 200:**
```json
{ "message": "Room updated successfully", "room": { "...full room object..." } }
```

**Errors:** 400 (missing id), 403 (not owner), 404 (not found), 422 (no fields)

---

## DELETE /delete

Delete a room and its bookings.

**Authentication:** `owner` role required (must own the hotel)

**Request Body (JSON):**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id        | int  | Yes      | Room ID     |

**Response 200:**
```json
{ "message": "Room deleted successfully" }
```

**Errors:** 400 (missing id), 403 (not owner), 404 (not found)
