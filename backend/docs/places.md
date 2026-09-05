# Nearby Places API

**Base URL:** `http://localhost:8090/api/places`

---

## GET /list

List all nearby places for a hotel.

**Authentication:** None (public)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| hotel_id  | int  | Yes      | Hotel ID    |

**Response 200:**
```json
{
  "places": [
    {
      "id": 1,
      "hotel_id": 1,
      "name": "Eiffel Tower",
      "description": "Famous landmark",
      "location_url": "https://maps.google.com/...",
      "latitude": 48.8584,
      "longitude": 2.2945,
      "distance": "2.5 km",
      "category": "landmark"
    }
  ]
}
```

**Errors:** 400 (missing/invalid hotel_id)

---

## GET /geocode

Reverse-geocode latitude/longitude coordinates using the Google Geocoding API. Returns the place name and formatted address of the nearest point of interest.

**Authentication:** None (public)

**Query Parameters:**

| Parameter | Type  | Required | Description      |
|-----------|-------|----------|------------------|
| lat       | float | Yes      | Latitude         |
| lng       | float | Yes      | Longitude        |

**Response 200:**
```json
{
  "name": "Eiffel Tower",
  "display_name": "Eiffel Tower, Champ de Mars, 5 Av. Anatole France, 75007 Paris, France",
  "latitude": 48.8584,
  "longitude": 2.2945
}
```

**Errors:** 400 (missing/invalid lat or lng), 404 (no results found), 502 (Google API failure), 500 (API key not configured)

---

## POST /extract

Extract place name and coordinates from a Google Maps URL (e.g. `https://maps.google.com/?q=...` or `https://goo.gl/maps/...`). Resolves short links, parses `@lat,lng` and `/place/Name/` patterns, and enriches with the Geocoding API when coordinates are found.

**Authentication:** None (public)

**Request Body (JSON):**

| Parameter | Type   | Required | Description        |
|-----------|--------|----------|--------------------|
| url       | string | Yes      | Google Maps / short URL to parse |

**Response 200:**
```json
{
  "name": "Eiffel Tower",
  "display_name": "Champ de Mars, 5 Av. Anatole France, 75007 Paris, France",
  "latitude": 48.8584,
  "longitude": 2.2945
}
```

**Errors:** 400 (missing url), 500 (failure)

---

## POST /create

**Authentication:** `owner` role required (must own the hotel)

**Request Body (JSON):**

| Parameter   | Type   | Required | Description              |
|-------------|--------|----------|--------------------------|
| hotel_id    | int    | Yes      | Hotel ID                 |
| name        | string | Yes      | Place name               |
| description | string | No       | Place description        |
| location_url| string | No       | Google Maps / location URL |
| latitude    | float  | No       | Latitude for map marker  |
| longitude   | float  | No       | Longitude for map marker |
| distance    | string | No       | Distance (e.g. "2.5 km") |
| category    | string | No       | e.g. restaurant, landmark |

**Response 201:**
```json
{ "message": "Place created successfully", "place": { "...full place object..." } }
```

**Errors:** 401/403 (not owner), 404 (hotel not found), 422 (validation)

---

## PUT /update

Update a nearby place.

**Authentication:** `owner` role required (must own the hotel)

**Request Body (JSON):**

| Parameter   | Type   | Required | Description        |
|-------------|--------|----------|--------------------|
| id          | int    | Yes      | Place ID           |
| name        | string | No       | Updated name       |
| description | string | No       | Updated description |
| location_url| string | No       | Updated location URL |
| latitude    | float  | No       | Updated latitude   |
| longitude   | float  | No       | Updated longitude  |
| distance    | string | No       | Updated distance   |
| category    | string | No       | Updated category   |

**Response 200:**
```json
{ "message": "Place updated successfully", "place": { "...full place object..." } }
```

**Errors:** 400 (missing id), 403 (not owner), 404 (not found), 422 (no fields)

---

## DELETE /delete

Delete a nearby place.

**Authentication:** `owner` role required (must own the hotel)

**Request Body (JSON):**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id        | int  | Yes      | Place ID    |

**Response 200:**
```json
{ "message": "Place deleted successfully" }
```

**Errors:** 400 (missing id), 403 (not owner), 404 (not found)
