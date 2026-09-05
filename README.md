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
stayvora/
├── frontend/                  # React client
│   └── src/
│       ├── pages/        # Landing, Home, SearchResults, HotelDetail,
│       │                 # Booking, Confirmation, dashboards, auth pages...
│       ├── components/   # Navbar, HotelCard, CalendarPicker, FilterPanel...
│       └── utils/        # Axios API client
└── backend/     # PHP REST API
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

### Quick start (recommended — XAMPP/Apache, like Findora)

The StayVora backend is a PHP app served by **Apache (XAMPP/WAMP/LAMP) on port 80**, and the frontend is a React app that proxies API calls to it — the same layout as the Findora project.

```bash
# 1. Copy the backend into Apache's web root
cp -r backend /your/xampp/htdocs/stayvora-backend

# 2. Start MySQL and Apache (e.g. "Start All" in XAMPP), then create the DB once:
mysql -u root -e "CREATE DATABASE IF NOT EXISTS stayvora"
mysql -u root stayvora < backend/schema.sql

# 3. Run the frontend (it proxies /stayvora-backend → http://localhost:80)
cd frontend
npm install
npm run dev
```

> 💡 **One command after setup:** inside the `frontend` folder, `npm run dev` starts the Vite dev server on port 3000. It forwards every `/stayvora-backend/*` request to Apache on port 80 (same-origin, so the session cookie works). Open **http://localhost:3000**.
>
> Seed login: **admin@stayvora.com / password** (only on a freshly imported database).

### Environment variables
Copy `frontend/.env.example` to `frontend/.env` if you need to point the frontend at a different API:

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | URL prefix where the backend is served. Default `/stayvora-backend` — must match the folder name you used inside Apache's web root (e.g. `htdocs/stayvora-backend`) |
| `VITE_BACKEND_URL` | (dev only) Backend proxy target in `vite.config.js`. Defaults to `http://localhost:80` |

### Manual setup

#### 1. Set up the database
```bash
mysql -u root -e "CREATE DATABASE stayvora"
mysql -u root stayvora < backend/schema.sql
```
> Default DB config lives in `backend/config/database.php` (host: `localhost`, db: `stayvora`, user: `root`, no password). Make sure MySQL is running first, and adjust `database.php` if your credentials differ.

### 2. Run the backend (Apache on port 80)
```bash
# Copy the backend folder into Apache's web root
cp -r backend /your/xampp/htdocs/stayvora-backend
```
> Start Apache in XAMPP. The bundled `backend/.htaccess` routes every `/api/*` and `/uploads/*` request to `index.php` (front-controller pattern). The API is served at `http://localhost/stayvora-backend/api`.

> ⚠️ If you rename the folder (e.g. `htdocs/Backend`), update `VITE_API_BASE_URL` in `frontend/.env` to match — `index.php` automatically detects its own folder so routes always resolve.

### 3. Run the frontend (port 3000)
```bash
cd frontend
npm install
npm run dev
```

Then open **http://localhost:3000** in your browser.

## 🔌 API Documentation

Full REST API reference (all endpoints, parameters, roles, and error codes) is available in [`backend/docs/README.md`](backend/docs/README.md), with per-module docs for:

- [Auth](backend/docs/auth.md)
- [Hotels](backend/docs/hotels.md)
- [Rooms](backend/docs/rooms.md)
- [Bookings](backend/docs/bookings.md)
- [Events](backend/docs/events.md) · [Offers](backend/docs/offers.md) · [Places](backend/docs/places.md)
- [Admin](backend/docs/admin.md)

## 🗄 Database Schema

The main entities (see [`schema.sql`](backend/schema.sql)):

`users` · `hotels` · `rooms` · `hotel_images` · `bookings` · `reviews` · `events` · `special_offers` · `nearby_places` · `notifications`

## 👥 User Roles

| Role         | Access                                                            |
|--------------|-------------------------------------------------------------------|
| **Traveler** | Search & book hotels, manage own bookings, write reviews          |
| **Owner**    | List & manage hotels, rooms, offers, events, places, and bookings |
| **Admin**    | Platform-wide hotel oversight and removal                         |

Routes are protected on both ends — the frontend uses a `ProtectedRoute` component while the backend enforces session-based role checks per endpoint.
