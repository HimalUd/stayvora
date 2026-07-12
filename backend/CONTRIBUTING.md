# StayVora Backend — Contribution Guide

## Overview

This document divides backend development work among four contributors. Each contributor is responsible for specific API routes, controllers, models, and related files.

## Repository Structure

```
backend/
├── Controllers/       # Business logic
├── Middleware/         # Auth, validation, error handling
├── Models/            # Database models
├── Views/             # Email templates, etc.
├── api/               # Route definitions
│   ├── admin/
│   ├── auth/
│   ├── bookings/
│   ├── events/
│   ├── hotels/
│   ├── offers/
│   ├── places/
│   └── rooms/
├── config/            # App configuration
├── uploads/           # File uploads
└── utils/             # Utility functions
```

## Contributor Assignments

| Contributor | Role | Responsibilities |
|------------|------|-----------------|
| **Himal** | Places, Events & Offers | `api/places`, `api/events`, `api/offers`, corresponding controllers & models |
| **Isuru** | Hotels & Rooms | `api/hotels`, `api/rooms`, corresponding controllers & models |
| **Lohansa** | Auth & Bookings | `api/auth`, `api/bookings`, `Middleware`, corresponding controllers & models |
| **Shashikala** | Admin & Config | `api/admin`, `config/`, `utils/`, `uploads/`, `Views/`, corresponding controllers & models |

## File Mapping Key

| Symbol | Meaning |
|--------|---------|
| `S` | `~/Documents/My Files/stayvora/Backend` |
| `D` | `~/Desktop/stayvora/backend` |

All paths below are relative to `S` and `D`.

## Dependency Order

1. **config/** — database and app config, needed by everything
2. **Models/** — database schemas, needed by controllers
3. **Middleware/** — auth & validation middleware, needed by routes
4. **utils/** — shared helpers, needed by controllers
5. **Controllers/** — business logic, needed by routes
6. **api/** — route definitions, ties everything together
7. **Views/** — email templates (independent)
8. **uploads/** — file storage (independent)

See individual contributor files (`HIMAL.md`, `ISURU.md`, `LOHANSA.md`, `SHASHIKALA.md`) for detailed migration steps.
