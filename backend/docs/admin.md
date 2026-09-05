# Admin API

**Base URL:** `http://localhost/Backend/api/admin`

---

## GET /hotels

Get all hotels with booking statistics (admin dashboard).

**Authentication:** `admin` role required

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
      "status": "active",
      "created_at": "2024-01-01 12:00:00",
      "owner_name": "Jane Owner",
      "owner_email": "jane@example.com",
      "owner_phone": "9876543210",
      "total_bookings": 15,
      "confirmed_bookings": 10
    }
  ]
}
```

**Errors:** 401/403 (not admin)

---

## DELETE /delete_hotel

Delete any hotel regardless of ownership (admin only). Removes all related data.

**Authentication:** `admin` role required

**Request Body (JSON):**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id        | int  | Yes      | Hotel ID    |

**Response 200:**
```json
{ "message": "Hotel deleted successfully by admin" }
```

**Errors:** 400 (missing id), 403 (not admin), 404 (not found), 500 (transaction failure)
