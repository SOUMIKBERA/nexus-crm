# NexusCRM – Full-Stack MERN Mini-CRM Application

> A production-ready CRM built with MongoDB, Express.js, React.js, and Node.js, featuring JWT authentication, role-based access, full contact CRUD, pagination, activity logging, and CSV export.

---

## 🏗️ Architecture

### Why Monorepo + MVC (Not Microservices)?

For a Mini-CRM at this scale, a **well-structured monorepo with clean MVC separation** is the industry-preferred choice over microservices. Here's why:

| Concern | Microservices | MVC Monorepo (Chosen) |
|---|---|---|
| Team size | 10+ engineers | 1–5 engineers |
| Deployment complexity | Kubernetes, service mesh | Single Render/Railway deploy |
| Overhead | API Gateway, service discovery | Minimal |
| Debugging | Distributed tracing needed | Simple logs |
| Scale-readiness | Yes (overkill here) | Modular, easy to extract later |

> **Industry context:** Companies like Shopify, GitHub, and Basecamp run critical products as well-structured monoliths. Microservices are adopted when teams and traffic justify the operational cost.

### Backend Architecture (Node.js + Express + MongoDB)

```
crm-backend/
├── src/
│   ├── config/          # Database connection
│   ├── controllers/     # Business logic (auth, contacts, activities)
│   ├── middleware/       # Auth guard, rate limiter, error handler, validator
│   ├── models/          # Mongoose schemas (User, Contact, Activity)
│   ├── routes/          # Express routers
│   └── utils/           # JWT helpers, Logger, ApiError class
└── tests/               # Jest + Supertest integration tests
```

**Design Patterns used:**
- **MVC (Model-View-Controller)** — clean separation of concerns
- **Repository pattern** — Mongoose models abstract DB operations
- **Middleware chain** — composable request pipeline
- **Centralized error handling** — single error handler, operational vs programmer errors
- **Token Rotation** — refresh token stored server-side, rotated on each use

### Frontend Architecture (React 18)

```
crm-frontend/
├── public/
└── src/
    ├── components/
    │   ├── auth/         # ProtectedRoute HOC
    │   ├── contacts/     # ContactTable, ContactModal
    │   ├── common/       # Pagination, LoadingSpinner
    │   └── layout/       # Layout with sidebar nav
    ├── pages/            # LoginPage, SignupPage, DashboardPage, ContactsPage, ActivitiesPage
    ├── services/         # API layer (axios instances + service modules)
    ├── store/            # Zustand global state (auth)
    └── styles/           # CSS modules + global variables
```

**Key frontend patterns:**
- **Zustand** — lightweight, unopinionated state management (preferred over Redux for smaller apps)
- **CSS Modules** — scoped styles, no class name collisions
- **Axios interceptors** — automatic token injection + silent token refresh
- **Debounced search** — 400ms debounce prevents excessive API calls
- **Protected Routes** — HOC pattern using React Router v6 outlet

### Security Architecture

```
Request → Rate Limiter → CORS → Helmet → JWT Auth → NoSQL Sanitize → Controller
```

- **Helmet.js** — HTTP security headers (CSP, HSTS, etc.)
- **express-mongo-sanitize** — prevents NoSQL injection attacks
- **bcryptjs (12 rounds)** — password hashing
- **JWT Access Token (15m) + Refresh Token (7d)** — short-lived access, rotating refresh
- **Rate limiting** — 3 login attempts per 10 minutes
- **Input validation** — express-validator on all endpoints

---

## 🚀 Live Deployment

| Service | URL |
|---|---|
| **Frontend** | `https://your-app.vercel.app` |
| **Backend API** | `https://your-api.railway.app` |
| **API Docs** | `https://your-api.railway.app/api-docs` |

---

## 📦 Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier) OR local MongoDB
- Git

### Backend Setup

```bash
# 1. Clone and enter backend
cd crm-backend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Edit .env with your values

# 4. Start development server
npm run dev
# Server runs on http://localhost:5000

# 5. Run tests
npm test

# 6. Run tests with coverage
npm run test -- --coverage
```

### Required `.env` Variables (Backend)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=600000
RATE_LIMIT_MAX=3
CLIENT_URL=http://localhost:3000
```

### Frontend Setup

```bash
# 1. Enter frontend
cd crm-frontend

# 2. Install dependencies
npm install

# 3. Create environment file
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# 4. Start development server
npm start
# App runs on http://localhost:3000

# 5. Run tests
npm test
```

---

## 🌐 Deployment Guide

### Option A: Render.com (Backend) + Vercel (Frontend) — Recommended

**Backend on Render:**
1. Create account at render.com
2. New Web Service → Connect GitHub repo (crm-backend)
3. Build command: `npm install`
4. Start command: `node src/server.js`
5. Add all environment variables in Render dashboard
6. Deploy

**Frontend on Vercel:**
1. Create account at vercel.com
2. Import GitHub repo (crm-frontend)
3. Add env variable: `REACT_APP_API_URL=https://your-render-api-url/api`
4. Deploy

### Option B: Railway (Full Stack)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Option C: Docker (Self-hosted)

```bash
# Clone both repos into same directory
# Create .env file with production values

# Build and run
docker-compose up --build -d

# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

---

## 📡 API Documentation

### Base URL: `http://localhost:5000/api`

### Authentication Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/auth/signup` | No | Register new user |
| POST | `/auth/login` | No | Login (rate limited: 3/10min) |
| POST | `/auth/refresh` | No | Refresh access token |
| POST | `/auth/logout` | Yes | Logout user |
| GET | `/auth/me` | Yes | Get current user |

**Signup Request:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "SecurePass123"
}
```

**Login Response:**
```json
{
  "success": true,
  "data": {
    "user": { "_id": "...", "name": "Jane Smith", "email": "...", "role": "user" },
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
  }
}
```

### Contact Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/contacts` | Yes | Get contacts (paginated, searchable) |
| GET | `/contacts/:id` | Yes | Get single contact |
| POST | `/contacts` | Yes | Create contact |
| PUT | `/contacts/:id` | Yes | Update contact |
| DELETE | `/contacts/:id` | Yes | Delete contact |
| GET | `/contacts/export` | Yes | Export as CSV |

**GET /contacts Query Parameters:**
```
?page=1&limit=10&search=john&status=Lead&sortBy=createdAt&order=desc
```

**Create Contact Request:**
```json
{
  "name": "John Doe",
  "email": "john@acme.com",
  "phone": "1234567890",
  "company": "Acme Corp",
  "status": "Lead",
  "notes": "Interested in enterprise plan"
}
```

**Paginated Response:**
```json
{
  "success": true,
  "data": {
    "contacts": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalContacts": 47,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 10
    }
  }
}
```

### Activity Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/activities` | Yes | Get activity log (paginated) |

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 401 | Unauthorized (invalid/expired token) |
| 403 | Forbidden (insufficient role) |
| 404 | Not found |
| 409 | Conflict (duplicate email) |
| 422 | Validation error |
| 429 | Too many requests (rate limited) |
| 500 | Internal server error |

---

## ✅ Features Checklist

### Authentication
- [x] User Signup with validation
- [x] User Login with bcrypt password comparison
- [x] JWT Access Token (15min) + Refresh Token (7 days)
- [x] Token rotation on refresh
- [x] Login rate limiting (3 requests per 10 min)
- [x] Protected backend routes (middleware)
- [x] Protected frontend routes (React Router)
- [x] Auto token refresh via Axios interceptors
- [x] Role-based access (Admin / User)

### Contact CRM
- [x] Full CRUD (Create, Read, Update, Delete)
- [x] Fields: Name, Email, Phone, Company, Status, Notes, CreatedAt/UpdatedAt
- [x] Status: Lead / Prospect / Customer
- [x] Search by name or email (debounced)
- [x] Filter by status
- [x] Pagination (10 per page)
- [x] CSV export
- [x] Activity log (add/edit/delete events)

### Technical Quality
- [x] Backend: MVC folder structure
- [x] Input validation (express-validator)
- [x] Global error handler with correct HTTP codes
- [x] MongoDB indexes for performance
- [x] Mongoose schema validation
- [x] NoSQL injection protection
- [x] Security headers (Helmet)
- [x] Backend unit/integration tests (Jest + Supertest)
- [x] Frontend unit tests (React Testing Library)
- [x] Responsive UI (mobile-friendly)
- [x] Form validation (frontend)
- [x] Docker containerization
- [x] Production-ready nginx config

---

## 🧪 Test Coverage

### Backend Tests (`crm-backend/tests/`)
- `auth.test.js` — 13 tests covering signup, login, refresh, logout, /me
- `contacts.test.js` — 16 tests covering all CRUD, search, filter, export, auth guards

### Frontend Tests (`crm-frontend/src/`)
- `ContactModal.test.js` — 8 tests covering add/edit mode, validation
- `Pagination.test.js` — 7 tests covering navigation, disabled states

```bash
# Run backend tests
cd crm-backend && npm test

# Run frontend tests
cd crm-frontend && npm test
```

---

## 📐 Database Schema

### User
```javascript
{
  name: String (2-50 chars),
  email: String (unique, validated),
  password: String (hashed, bcrypt 12 rounds),
  role: "admin" | "user",
  refreshToken: String,
  isActive: Boolean,
  lastLogin: Date,
  timestamps: true
}
```

### Contact
```javascript
{
  name: String (2-100 chars),
  email: String (validated),
  phone: String (regex validated),
  company: String,
  status: "Lead" | "Prospect" | "Customer",
  notes: String (max 1000),
  createdBy: ObjectId (ref: User),
  timestamps: true,
  indexes: [createdBy+createdAt, text(name+email)]
}
```

### Activity
```javascript
{
  action: "CREATE" | "UPDATE" | "DELETE",
  entity: String,
  entityId: ObjectId,
  entityName: String,
  performedBy: ObjectId (ref: User),
  changes: Mixed,
  timestamps: true
}
```

---

## 🔧 Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Frontend | React 18 | Industry standard, rich ecosystem |
| State Management | Zustand | Lightweight, no boilerplate |
| Routing | React Router v6 | Latest stable, file-less routes |
| HTTP Client | Axios | Interceptors, error handling |
| Styling | CSS Modules | Scoped, no runtime overhead |
| Backend | Node.js + Express | Non-blocking I/O, REST-friendly |
| Database | MongoDB + Mongoose | Flexible schema, JSON-native |
| Auth | JWT + bcryptjs | Stateless, industry standard |
| Validation | express-validator | Declarative, chainable |
| Rate Limiting | express-rate-limit | Configurable, memory store |
| Logging | Winston | Structured logs, multiple transports |
| Security | Helmet + mongo-sanitize | Defense in depth |
| Testing (BE) | Jest + Supertest + mongodb-memory-server | No external DB needed |
| Testing (FE) | React Testing Library | Testing as user, not implementation |
| Containerization | Docker + nginx | Reproducible deployments |