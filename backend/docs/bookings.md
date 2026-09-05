# Bookings API

**Base URL:** `http://localhost/Backend/api/bookings`

---

## POST /create

Create a new booking. Sends email confirmation to user and hotel owner.

**Authentication:** Login required (any role)

**Request Body (JSON):**

| Parameter        | Type   | Required | Description                   |
|------------------|--------|----------|-------------------------------|
| hotel_id         | int    | Yes      | Hotel ID                      |
| room_id          | int    | Yes      | Room ID                       |
| check_in         | date   | Yes      | Check-in date (Y-m-d)         |
| check_out        | date   | Yes      | Check-out date (Y-m-d)        |
| guests           | int    | No       | Number of guests (default 1)  |
| first_name       | string | No       | Guest first name              |
| last_name        | string | No       | Guest last name               |
| email            | string | No       | Guest email                   |
| phone            | string | No       | Guest phone                   |
| special_requests | string | No       | Special requests text         |

**Price Calculation:** `room.price * number of nights` (min 1 night)

**Booking Code Format:** `BKD` + 7 hex characters

**Validation:**
- check_out must be after check_in
- Room must exist, belong to hotel, and be available
- No overlapping bookings for same room (status pending/confirmed)

**Response 201:**
```json
{
  "message": "Booking created successfully",
  "booking": {
    "id": 1,
    "user_id": 1,
    "hotel_id": 1,
    "room_id": 1,
    "booking_code": "BKD4F2A1B",
    "check_in": "2024-07-01",
    "check_out": "2024-07-05",
    "guests": 2,
    "total_price": 600.00,
    "status": "pending",
    "guest_name": "John Doe",
    "guest_email": "john@example.com",
    "guest_phone": "1234567890",
    "special_requests": "Extra pillow",
    "created_at": "2024-06-15 10:00:00"
  }
}
```

**Errors:** 401 (not logged in), 422 (validation), 404 (room/hotel not found), 400 (room unavailable), 409 (already booked)

---

## GET /list_user

Get all bookings for the currently logged-in user.

**Authentication:** Login required

**Response 200:**
```json
{
  "bookings": [
    {
      "id": 1,
      "booking_code": "BKD4F2A1B",
      "check_in": "2024-07-01",
      "check_out": "2024-07-05",
      "guests": 2,
      "total_price": 600.00,
      "status": "pending",
      "guest_name": "John Doe",
      "guest_email": "john@example.com",
      "guest_phone": "1234567890",
      "special_requests": "Extra pillow",
      "created_at": "2024-06-15 10:00:00",
      "hotel_name": "Grand Hotel",
      "hotel_location": "Paris",
      "room_type": "Deluxe",
      "room_price": 150.00,
      "hotel_image": "uploads/hotel1.jpg"
    }
  ]
}
```

**Errors:** 401 (not logged in)

---

## GET /list_owner

Get all bookings for hotels owned by the current user.

**Authentication:** `owner` role required

**Response 200:**
```json
{
  "bookings": [
    {
      "id": 1,
      "booking_code": "BKD4F2A1B",
      "check_in": "2024-07-01",
      "check_out": "2024-07-05",
      "total_price": 600.00,
      "status": "pending",
      "created_at": "2024-06-15 10:00:00",
      "hotel_name": "Grand Hotel",
      "room_type": "Deluxe",
      "user_name": "John Doe",
      "user_email": "john@example.com",
      "user_phone": "1234567890"
    }
  ]
}
```

**Errors:** 401/403 (not owner)

---

## PUT /confirm

Confirm a pending booking. Sends email to guest.

**Authentication:** `owner` role required (must own the hotel)

**Request Body (JSON):**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id        | int  | Yes      | Booking ID  |

**Validation:** Booking status must be `pending`

**Response 200:**
```json
{ "message": "Booking confirmed successfully", "booking": { "...with status 'confirmed'..." } }
```

**Errors:** 400 (missing id / not pending), 403 (not owner), 404 (not found)

---

## PUT /cancel

Cancel a booking (sets status to `cancelled`). Sends email to guest.

**Authentication:** `owner` role required (must own the hotel)

**Request Body (JSON):**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id        | int  | Yes      | Booking ID  |

**Validation:** Booking must not already be `cancelled`

**Response 200:**
```json
{ "message": "Booking cancelled successfully", "booking": { "...with status 'cancelled'..." } }
```

**Errors:** 400 (missing id / already cancelled), 403 (not owner), 404 (not found)
