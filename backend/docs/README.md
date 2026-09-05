# StayVora Backend API Documentation

REST API for the StayVora hotel booking platform.

**Base URL:** `http://localhost/Backend/api`

**Format:** JSON (requests use `Content-Type: application/json` unless noted)

**Auth:** Session-based (PHP sessions). Login via `POST /api/auth/login`, then send requests with the session cookie (`credentials: include` in the frontend). Role checks are enforced per endpoint (`traveler`, `owner`, `admin`).

**CORS:** Allows `http://localhost:3000` with credentials.

## Endpoints

| Module   | Base Path            | Docs                     |
|----------|----------------------|--------------------------|
| Auth     | `/api/auth`          | [auth.md](auth.md)       |
| Hotels   | `/api/hotels`        | [hotels.md](hotels.md)   |
| Rooms    | `/api/rooms`         | [rooms.md](rooms.md)     |
| Bookings | `/api/bookings`      | [bookings.md](bookings.md) |
| Events   | `/api/events`        | [events.md](events.md)   |
| Offers   | `/api/offers`        | [offers.md](offers.md)   |
| Places   | `/api/places`        | [places.md](places.md)   |
| Admin    | `/api/admin`         | [admin.md](admin.md)     |

## Route Summary

### Auth
- `POST /api/auth/register` - Register user (`traveler` or `owner`)
- `POST /api/auth/login` - Login, start session
- `POST /api/auth/logout` - Destroy session
- `GET /api/auth/check_session` - Check session (also `/check-session`)

### Hotels
- `GET /api/hotels/list` - List active hotels (optional `?search=`)
- `GET /api/hotels/get?id=` - Hotel details with rooms, events, offers, places, images
- `GET /api/hotels/search` - Advanced search (dates, price, rating, purpose, event)
- `GET /api/hotels/my` - Current owner's hotels (owner)
- `POST /api/hotels/create` - Create hotel (owner)
- `PUT /api/hotels/update` - Update hotel (owner)
- `DELETE /api/hotels/delete` - Delete hotel + related data (owner)
- `POST /api/hotels/add_image` - Add image (upload or URL) (owner)
- `DELETE /api/hotels/delete_image` - Delete image (owner)
- `POST /api/hotels/add_amenity` - Add amenity (owner)
- `POST /api/hotels/delete_amenity` - Remove amenity (owner)

### Rooms
- `GET /api/rooms/list?hotel_id=` - List rooms for hotel
- `POST /api/rooms/create` - Create room (owner)
- `PUT /api/rooms/update` - Update room (owner)
- `DELETE /api/rooms/delete` - Delete room (owner)

### Bookings
- `POST /api/bookings/create` - Create booking (login required)
- `GET /api/bookings/list_user` - Current user's bookings (also `/list-user`)
- `GET /api/bookings/list_owner` - Owner's hotel bookings (also `/list-owner`)
- `PUT /api/bookings/confirm` - Confirm booking (owner)
- `PUT /api/bookings/cancel` - Cancel booking (owner)

### Events
- `GET /api/events/list?hotel_id=` - List events for hotel
- `POST /api/events/create` - Create event (owner)
- `PUT /api/events/update` - Update event (owner)
- `DELETE /api/events/delete` - Delete event (owner)

### Special Offers
- `GET /api/offers/list?hotel_id=` - List active offers for hotel
- `POST /api/offers/create` - Create offer (owner)
- `PUT /api/offers/update` - Update offer (owner)
- `DELETE /api/offers/delete` - Delete offer (owner)

### Nearby Places
- `GET /api/places/list?hotel_id=` - List places for hotel
- `GET /api/places/geocode?lat=&lng=` - Reverse geocode coordinates
- `POST /api/places/extract` - Extract place data from Google Maps URL
- `POST /api/places/create` - Add place (owner)
- `PUT /api/places/update` - Update place (owner)
- `DELETE /api/places/delete` - Delete place (owner)

### Admin
- `GET /api/admin/hotels` - All hotels with booking stats (admin)
- `DELETE /api/admin/delete_hotel` - Delete any hotel (admin, also `/delete-hotel`)

## Common Errors

| Code | Meaning                                  |
|------|------------------------------------------|
| 400  | Missing/invalid required parameter       |
| 401  | Not logged in                            |
| 403  | Wrong role / not owner of the resource   |
| 404  | Resource not found                       |
| 409  | Duplicate resource (e.g. email, booking) |
| 422  | Validation error                         |
| 500  | Server error                             |
