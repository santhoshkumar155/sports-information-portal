# Sports Information Portal

A full-stack web app for browsing matches, teams, players and news across six sports (Cricket, Football, Basketball, Tennis, Hockey, Badminton), with user accounts and an admin panel.

**Stack:** React + Vite + React Router + Axios (frontend), Node.js + Express (REST API), MongoDB + Mongoose, JWT + bcryptjs.

## Prerequisites

- Node.js 18 or newer
- MongoDB running locally on `mongodb://127.0.0.1:27017` (or a MongoDB Atlas URI)

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # on Windows: copy .env.example .env
```

Edit `backend/.env` and set `JWT_SECRET` to a long random string:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/sports_portal
JWT_SECRET=replace_with_a_secure_secret
```

Load the sample data (this **clears** users, matches, teams, players and news first):

```bash
npm run seed
```

Start the API:

```bash
npm run dev      # auto-restarts on changes (nodemon)
# or
npm start
```

The API runs on http://localhost:5000.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. During development Vite forwards `/api` requests to the backend on port 5000, so no extra frontend configuration is needed. To point at a different API, set `VITE_API_URL` in `frontend/.env`.

## Demo accounts (created by the seed script)

| Role  | Email                    | Password   |
|-------|--------------------------|------------|
| Admin | admin@sportsportal.com   | Admin@123  |
| User  | user@sportsportal.com    | User@123   |

Change the admin credentials by setting `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env` before running the seed. New registrations are always created as normal users.

## Features

- **Home:** hero, sports categories, live/upcoming matches, recent results, latest news, popular teams, top players and statistics, all loaded from the API.
- **Matches:** search, sport/status/date filters and sorting.
- **Teams / Players:** search and sport, country (and team) filters; player cards expand to show biography and statistics.
- **News:** search, category filter, featured article and a Read more reader.
- **Auth:** register, login, JWT-protected routes, profile page with name and password updates.
- **Admin panel (`/admin`):** dashboard totals, full add/edit/delete for matches, teams, players and news, and a users list.

## REST API

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | public |
| POST | `/api/auth/login` | public |
| GET / PUT | `/api/auth/profile` | logged in |
| GET | `/api/auth/users` | admin |
| GET | `/api/matches`, `/api/matches/:id` | public |
| POST / PUT / DELETE | `/api/matches`, `/api/matches/:id` | admin |
| GET | `/api/teams`, `/api/teams/:id` | public |
| POST / PUT / DELETE | `/api/teams`, `/api/teams/:id` | admin |
| GET | `/api/players`, `/api/players/:id` | public |
| POST / PUT / DELETE | `/api/players`, `/api/players/:id` | admin |
| GET | `/api/news`, `/api/news/:id` | public |
| POST / PUT / DELETE | `/api/news`, `/api/news/:id` | admin |
| GET | `/api/dashboard/stats` | public (totals shown on the home page) |
| GET | `/api/dashboard/admin-stats` | admin (adds the user count) |

List endpoints accept query filters, for example `/api/matches?sport=Cricket&status=Upcoming&date=2026-10-10&sort=dateAsc&search=india`.

Error codes: 400 validation or invalid id, 401 missing/invalid token, 403 not an admin, 404 not found.

## Project structure

```
sports-information-portal/
├── backend/   config, controllers, middleware, models, routes, seed, server.js
├── frontend/  src/components, src/pages, src/services/api.js, App.jsx, main.jsx
└── README.md
```

## Notes

- Team and player images are optional URLs. When none is set (or the URL fails to load) the cards show initials or a coloured category banner instead.
- Match dates are stored as UTC midnight and shown as the same calendar date for every viewer.
- Never commit `backend/.env`; it is listed in `.gitignore`.
