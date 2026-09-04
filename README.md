# StayVora 🏨

StayVora is a full-stack **hotel booking platform** where travelers can discover and book hotels across Sri Lanka, and hotel owners can list and manage their properties. It supports three user roles — **Traveler**, **Hotel Owner**, and **Admin** — each with their own dedicated experience.

## ✨ Features

### Travelers
- Register / login with **email verification**
- Browse hotels and search with advanced filters (check-in/check-out dates, price range, star rating, trip purpose, events)
- View hotel details — rooms, special offers, events, nearby places, amenities, image gallery, and reviews
- Book rooms with real-time availability checking via a calendar picker
- View and track bookings ("My Bookings")
- In-app notifications

### Hotel Owners
- Dedicated owner portal (register / login)
- Register new hotels with images, amenities, and location
- Manage rooms (create / update / delete) and pricing
- Manage special offers, events, and nearby places (with Google Maps integration)
- Manage bookings — confirm or cancel guest bookings
- Read guest reviews for their hotels

### Admins
- Admin dashboard with all hotels and booking statistics
- Remove any hotel from the platform

## 🛠 Tech Stack

| Layer    | Technologies                                                                 |
|----------|------------------------------------------------------------------------------|
| Frontend | React 18 (Create React App), React Router 6, Axios, React Query, React Hook Form + Zod |
| Backend  | PHP (REST API, front-controller routing), PDO                                |
| Database | MySQL                                                                        |
| Auth     | Session-based authentication with role-based access control                  |
| Extras   | Google Maps / Geocoding utilities, email verification (`mail()`), file uploads |

## 📁 Project Structure

```
stayvora-recreated/
├── Hotel-Availability-System--Frontend/   # React client
│   └── src/
│       ├── pages/        # Landing, Home, SearchResults, HotelDetail,
│       │                 # Booking, Confirmation, dashboards, auth pages...
│       ├── components/   # Navbar, HotelCard, CalendarPicker, FilterPanel...
│       └── utils/        # Axios API client
└── Hotel-Availability-System-Backend/     # PHP REST API
    ├── api/              # Endpoint entry scripts (auth, hotels, rooms, ...)
    ├── app/
    │   ├── Controllers/  # Auth, Hotel, Room, Booking, Admin, ... controllers
    │   ├── Core/         # Base controller & router helpers
    │   └── Models/       # Database models
    ├── config/           # Database, session, Google config
    ├── utils/            # CORS, auth middleware, email, maps helpers
    ├── uploads/          # Hotel & destination images
    ├── schema.sql        # Full database schema + seed data
    └── docs/             # Detailed API documentation per module
```

## 🚀 Getting Started

### Prerequisites
- [PHP](https://www.php.net/) >= 8 with PDO MySQL extension
- [MySQL](https://www.mysql.com/) (or XAMPP / MAMP)
- [Node.js](https://nodejs.org/) >= 14 and npm

### Quick start (recommended)
```bash
./start.sh
```
This creates the `stayvora` database (if missing), starts the backend on port 8090 (with the `index.php` router) and the frontend on port 3000.

> 💡 **One command after cloning:** inside the frontend folder, `npm start` (or `npm run dev`) automatically ensures the database exists, installs dependencies on first run, and starts the backend for you — so a fresh clone works with just:
> ```bash
> cd Hotel-Availability-System--Frontend
> npm start
> ```
> Seed login: **admin@stayvora.com / password** (only on a freshly imported database).

### Manual setup

#### 1. Set up the database
```bash
mysql -u root -e "CREATE DATABASE stayvora"
mysql -u root stayvora < Hotel-Availability-System-Backend/schema.sql
```
> Default DB config lives in `Hotel-Availability-System-Backend/config/database.php` (host: `localhost`, db: `stayvora`, user: `root`, no password). Make sure MySQL is running first, and adjust `database.php` if your credentials differ.

### 2. Run the backend (port 8090)
```bash
cd Hotel-Availability-System-Backend
php -S localhost:8090 index.php
```
The API will now be available at `http://localhost:8090/api`. All routes are defined in `index.php` (front-controller pattern).

> ⚠️ **Important:** `index.php` must be passed as the router script. Running plain `php -S localhost:8090` will serve 404s for every `/api/*` and `/uploads/*` request — the frontend then shows "Network Error" on login/register and broken images.

> If the frontend runs on a different host/port than expected, set `REACT_APP_API_URL` before starting the frontend.

### 3. Run the frontend (port 3000)
```bash
cd Hotel-Availability-System--Frontend
npm install
npm start
```

Then open **http://localhost:3000** in your browser.

## 🔌 API Documentation

Full REST API reference (all endpoints, parameters, roles, and error codes) is available in [`Hotel-Availability-System-Backend/docs/README.md`](Hotel-Availability-System-Backend/docs/README.md), with per-module docs for:

- [Auth](Hotel-Availability-System-Backend/docs/auth.md)
- [Hotels](Hotel-Availability-System-Backend/docs/hotels.md)
- [Rooms](Hotel-Availability-System-Backend/docs/rooms.md)
- [Bookings](Hotel-Availability-System-Backend/docs/bookings.md)
- [Events](Hotel-Availability-System-Backend/docs/events.md) · [Offers](Hotel-Availability-System-Backend/docs/offers.md) · [Places](Hotel-Availability-System-Backend/docs/places.md)
- [Admin](Hotel-Availability-System-Backend/docs/admin.md)

## 🗄 Database Schema

The main entities (see [`schema.sql`](Hotel-Availability-System-Backend/schema.sql)):

`users` · `hotels` · `rooms` · `hotel_images` · `bookings` · `reviews` · `events` · `special_offers` · `nearby_places` · `notifications`

## 👥 User Roles

| Role         | Access                                                            |
|--------------|-------------------------------------------------------------------|
| **Traveler** | Search & book hotels, manage own bookings, write reviews          |
| **Owner**    | List & manage hotels, rooms, offers, events, places, and bookings |
| **Admin**    | Platform-wide hotel oversight and removal                         |

Routes are protected on both ends — the frontend uses a `ProtectedRoute` component while the backend enforces session-based role checks per endpoint.
