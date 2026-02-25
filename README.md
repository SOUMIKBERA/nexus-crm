# NexusCRM

A full-stack CRM application built with the MERN stack. Manages contacts through their sales lifecycle — from initial lead to paying customer — with a complete activity audit trail.

Built as part of a technical assessment. The goal was to demonstrate production-grade backend design, clean frontend architecture, and thoughtful decisions around security and data integrity.

---

## Live

| | URL |
|---|---|
| App | https://nexus-crm-kappa.vercel.app |
| API | https://nexuscrm-backend.onrender.com |

> The backend runs on Render's free tier, so the first request after a period of inactivity may take 20–30 seconds while the service wakes up. This is expected behaviour on the free plan.

---

## Repositories

- Frontend — https://github.com/SOUMIKBERA/nexus-crm/tree/main/crm-frontend
- Backend — https://github.com/SOUMIKBERA/nexus-crm/tree/main/crm-backend

---

## What it does

**Auth**
- Register and login with email + password
- Passwords hashed with bcrypt (12 rounds)
- JWT access tokens expire in 15 minutes; refresh tokens last 7 days and rotate on each use
- Login is rate-limited to 3 attempts per 10 minutes to prevent brute-force

**Contacts**
- Full create / read / update / delete
- Each contact has: name, email, phone, company, status (Lead → Prospect → Customer), notes
- Search by name or email, filter by status, paginated 10 per page
- Export all contacts to CSV with one click

**Activity log**
- Every create, update and delete is recorded automatically
- Shows what changed (field-level diff), who made the change, and when
- Paginated, available in its own view

---

## Tech choices and why

I want to be upfront about the decisions here rather than just listing libraries.

**Monorepo over microservices** — The scope doesn't justify the operational overhead of microservices. A clean MVC monolith is faster to develop, easier to debug, and straightforward to deploy. The code is structured so individual modules could be extracted later if the team or traffic grows to that point.

**Zustand over Redux** — For an app with one primary shared concern (auth state), Redux adds a lot of ceremony for very little benefit. Zustand gives a clean global store in about 30 lines. I'd reach for Redux Toolkit if the state requirements grew significantly more complex.

**CSS Modules over a utility framework** — Scoped styles with no runtime cost and no class name conflicts. The component styles live next to the components. It's a trade-off — less rapid for prototyping but cleaner for long-term maintenance.

**mongodb-memory-server for backend tests** — Tests run with a real MongoDB instance in memory. No external dependency, no mocking of the ODM layer. Tests are isolated, fast, and can run in CI without any setup.

---

## Project structure

```
crm-backend/
├── src/
│   ├── config/          # MongoDB connection setup
│   ├── controllers/     # Request handlers — auth, contacts, activities
│   ├── middleware/       # JWT auth, rate limiter, error handler, input validator
│   ├── models/          # Mongoose schemas — User, Contact, Activity
│   ├── routes/          # Express route definitions
│   └── utils/           # Token helpers, Winston logger, custom error class
└── tests/
    ├── auth.test.js      # 13 integration tests
    └── contacts.test.js  # 16 integration tests

crm-frontend/
└── src/
    ├── components/
    │   ├── auth/         # ProtectedRoute
    │   ├── common/       # Pagination, LoadingSpinner
    │   ├── contacts/     # ContactTable, ContactModal
    │   └── layout/       # Sidebar layout
    ├── pages/            # LoginPage, SignupPage, DashboardPage, ContactsPage, ActivitiesPage
    ├── services/         # Axios instance + API service modules
    ├── store/            # Zustand auth store
    └── styles/           # Global CSS variables and resets
```

---

## Running locally

### Requirements

- Node.js 18 or higher
- A MongoDB Atlas cluster (free tier is fine) or local MongoDB

### Backend

```bash
cd crm-backend
npm install
cp .env.example .env
# Fill in the values — see section below
npm run dev
```

Server starts at `http://localhost:5000`. You should see:

```
✅ MongoDB Connected
🚀 Server running on port 5000 [development]
```

### Frontend

```bash
cd crm-frontend
npm install
# Create a .env file with one line:
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
npm start
```

App opens at `http://localhost:3000`.

### Running tests

```bash
# Backend — 29 tests
cd crm-backend && npm test

# Frontend — 15 tests  
cd crm-frontend && npm test -- --watchAll=false
```

---

## Environment variables

### Backend (`crm-backend/.env`)

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/crm_db?retryWrites=true&w=majority
JWT_SECRET=<at-least-32-random-characters>
JWT_REFRESH_SECRET=<different-32-random-characters>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=600000
RATE_LIMIT_MAX=3
CLIENT_URL=http://localhost:3000
```

To generate the JWT secrets, run this in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Run it twice and use different values for each secret.

### Frontend (`crm-frontend/.env`)

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Change this to your deployed backend URL when deploying.

---

## API reference

Base URL: `http://localhost:5000/api`

**Auth**

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/auth/signup` | — | name, email, password |
| POST | `/auth/login` | — | Rate limited: 3 attempts / 10 min |
| POST | `/auth/refresh` | — | Sends refresh token, gets new pair |
| POST | `/auth/logout` | ✓ | Invalidates refresh token in DB |
| GET | `/auth/me` | ✓ | Returns current user |

**Contacts**

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/contacts` | ✓ | `?page=1&limit=10&search=&status=` |
| GET | `/contacts/:id` | ✓ | |
| POST | `/contacts` | ✓ | |
| PUT | `/contacts/:id` | ✓ | |
| DELETE | `/contacts/:id` | ✓ | |
| GET | `/contacts/export` | ✓ | Returns CSV file |

**Activities**

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/activities` | ✓ | `?page=1&limit=20` |

**Other**

| Method | Path | Notes |
|--------|------|-------|
| GET | `/health` | No auth, returns server status |

**Standard response envelope:**
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

**Error responses follow the same shape:**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Status codes used:** 200, 201, 401, 403, 404, 409 (duplicate email), 422 (validation), 429 (rate limit), 500

---

## Database schemas

**User**
```
name         String   required, 2–50 chars
email        String   unique, validated
password     String   bcrypt hashed, never returned in responses
role         String   "user" | "admin", default "user"
refreshToken String   stored on login, cleared on logout
isActive     Boolean  default true
lastLogin    Date
```

**Contact**
```
name         String   required, 2–100 chars
email        String   required, validated, unique per user
phone        String   regex validated if provided
company      String
status       String   "Lead" | "Prospect" | "Customer"
notes        String   max 1000 chars
createdBy    ObjectId ref User — contacts are user-scoped

Indexes:
  { createdBy: 1, createdAt: -1 }   — main listing query
  { name: "text", email: "text" }   — search
```

**Activity**
```
action       String   "CREATE" | "UPDATE" | "DELETE"
entity       String   "Contact"
entityId     ObjectId
entityName   String   denormalized for display after deletion
performedBy  ObjectId ref User
changes      Mixed    field-level diff { field: { from, to } }
```

---

## Deployment

The production setup uses Render for the backend and Vercel for the frontend. Both connect directly to GitHub and deploy on push to main.

**Backend on Render:**
1. New Web Service → connect the backend repo
2. Build command: `npm install`
3. Start command: `node src/server.js`
4. Add all env variables from the list above (use production values)
5. Set `NODE_ENV=production` and `PORT=10000`

**Frontend on Vercel:**
1. Import the frontend repo
2. Framework preset: Create React App (auto-detected)
3. Add env variable: `REACT_APP_API_URL=https://your-render-url.onrender.com/api`
4. Deploy

After both are live, update `CLIENT_URL` in your Render environment to the Vercel URL, so CORS is configured correctly.

**Docker (optional, for self-hosting):**
```bash
docker-compose up --build -d
# Frontend at :3000, Backend at :5000
```

---

## Security

- HTTP headers hardened with Helmet (CSP, HSTS, X-Frame-Options, etc.)
- Request bodies sanitized with express-mongo-sanitize before hitting any query
- Passwords never stored in plaintext; bcrypt with cost factor 12
- Access tokens are short-lived (15 min); compromise window is narrow
- Refresh tokens are stored in the database and rotated on every use — a stolen token becomes invalid after the legitimate user refreshes
- Login endpoint rate-limited independently from the global limiter
- All user input validated with express-validator before reaching controllers
- CORS configured to accept requests only from the known frontend origin

---

## Known limitations

- Refresh tokens are stored in a single field on the User document. In a multi-device scenario, only one active session is supported per user at a time. A proper implementation would use a separate tokens collection with one entry per device.
- The free Render instance sleeps after inactivity. Not suitable for production traffic.
- No email verification on signup. Adding a verification step would be the next obvious improvement to the auth flow.

---