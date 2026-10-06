# Herbal Medical Platform

A full-stack medical e-commerce and booking platform for a herbal general medicine practice.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Query, React Router |
| Backend | Django 4.2, Django REST Framework |
| Database | PostgreSQL 16 |
| Auth | JWT (djangorestframework-simplejwt) |
| Payments | Campay Mobile Money (MTN & Orange) |
| Email | Google SMTP (Gmail/Workspace) |
| Container | Docker + Docker Compose |
| Deploy | Render or Railway |

---

## Quick Start (Docker)

### 1. Clone and configure

```bash
git clone <your-repo>
cd herbal-medical

# Windows — copy env file
copy backend\.env.example backend\.env

# macOS/Linux
cp backend/.env.example backend/.env
```

Edit `backend/.env` — at minimum replace `SECRET_KEY` with a real random key, and fill in Campay and Gmail credentials when you have them. The file already has working defaults for local dev (SQLite-based Campay DEV mode, console email).

### 2. Start all services

```bash
docker compose up --build
```

Wait ~30 seconds for Postgres to initialize and migrations to run, then:

| Service | URL |
|---|---|
| Frontend (React) | http://localhost:5173 |
| Backend API | http://localhost:8000/api/ |
| Django Admin | http://localhost:8000/admin/ |
| API Docs (Swagger) | http://localhost:8000/api/docs/ |
| Custom Admin Panel | http://localhost:5173/admin |

### 3. Seed sample data

```bash
docker compose exec backend python seed_data.py
```

This creates:
- 8 herbal products across 5 categories
- 4 consultation services
- Doctor's weekly availability schedule (Mon–Sat)
- 3 compliance certificates
- 3 blog posts
- 2 coupons: `WELCOME10` (10% off) and `SAVE500` (500 XAF off)

Default accounts:
- **Admin**: `admin@herbalmedical.cm` / `admin1234`
- **Patient**: `patient@example.com` / `patient1234`

---

## Local Development (without Docker)

### Backend

```bash
cd backend

# Windows
python -m venv .venv
.venv\Scripts\activate

# macOS/Linux
python -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt

# Create .env (already done if you followed Quick Start)
# Defaults use SQLite — no Postgres needed for local dev

python manage.py migrate
python manage.py runserver
```

Then in another terminal, seed data:
```bash
python seed_data.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite proxy in `vite.config.js` forwards `/api` and `/media` requests to `http://localhost:8000` automatically.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `SECRET_KEY` | Django secret key | `your-secret-key` |
| `DEBUG` | Debug mode | `True` |
| `DATABASE_URL` | PostgreSQL connection URL | `postgres://user:pass@localhost:5432/db` |
| `ALLOWED_HOSTS` | Comma-separated allowed hosts | `localhost,127.0.0.1` |
| `CORS_ALLOWED_ORIGINS` | Frontend URL(s) | `http://localhost:5173` |
| `JWT_ACCESS_TOKEN_LIFETIME_MINUTES` | Access token expiry | `60` |
| `JWT_REFRESH_TOKEN_LIFETIME_DAYS` | Refresh token expiry | `7` |
| `CAMPAY_APP_USERNAME` | Campay API username | — |
| `CAMPAY_APP_PASSWORD` | Campay API password | — |
| `CAMPAY_ENVIRONMENT` | `DEV` or `PROD` | `DEV` |
| `EMAIL_BACKEND` | Django email backend | `django.core.mail.backends.smtp.EmailBackend` |
| `EMAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USE_TLS` | TLS | `True` |
| `EMAIL_HOST_USER` | Gmail address | `you@gmail.com` |
| `EMAIL_HOST_PASSWORD` | 16-char App Password | `xxxx xxxx xxxx xxxx` |
| `DEFAULT_FROM_EMAIL` | From address | `you@gmail.com` |
| `FRONTEND_URL` | Used in email links | `http://localhost:5173` |

> **Gmail App Password**: Google Account → Security → 2-Step Verification → App Passwords

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Django backend URL | `http://localhost:8000/api` |
| `VITE_MEDIA_URL` | Media files URL | `http://localhost:8000` |

---

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register/` | None | Register new user |
| POST | `/api/auth/login/` | None | Login, returns JWT |
| POST | `/api/auth/refresh/` | None | Refresh access token |
| POST | `/api/auth/logout/` | Required | Blacklist refresh token |
| GET/PATCH | `/api/auth/profile/` | Required | View/update profile |
| POST | `/api/auth/change-password/` | Required | Change password |

### Products & Services

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/categories/` | None | List categories |
| GET | `/api/products/` | None | List products (filterable) |
| GET | `/api/products/<slug>/` | None | Product detail |
| GET | `/api/services/` | None | List services |
| GET | `/api/services/<slug>/` | None | Service detail |

### Cart

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/cart/` | None | Get current cart |
| POST | `/api/cart/items/` | None | Add item |
| PATCH | `/api/cart/items/<id>/` | None | Update quantity |
| DELETE | `/api/cart/items/<id>/` | None | Remove item |
| POST | `/api/cart/merge/` | Required | Merge guest cart on login |

### Orders

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/orders/create/` | Required | Create order from cart |
| GET | `/api/orders/` | Required | List user's orders |
| GET | `/api/orders/<id>/` | Required | Order detail |

### Payments (Campay)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/payments/campay/collect/` | Required | Initiate MoMo payment |
| GET | `/api/payments/campay/status/<ref>/` | Required | Check payment status |
| POST | `/api/payments/campay/webhook/` | None | Campay webhook |

### Appointments

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/appointments/slots/?date=&service_id=` | None | Available time slots |
| GET | `/api/availability/` | None | Doctor's schedule |
| GET | `/api/availability/blocked/` | None | Blocked dates |
| GET/POST | `/api/appointments/` | Required | List/create appointments |
| DELETE | `/api/appointments/<id>/` | Required | Cancel appointment |

### Content

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/banners/active/` | None | Active banners |
| GET | `/api/blog/` | None | Blog posts |
| GET | `/api/blog/<slug>/` | None | Blog post detail |
| GET | `/api/certificates/` | None | Compliance certs |
| POST | `/api/coupons/validate/` | Required | Validate coupon |
| POST | `/api/reviews/` | Required | Create review |

### Admin

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/dashboard/` | Admin | Sales/booking stats |
| GET/POST | `/api/admin/banners/` | Admin | Manage banners |
| PATCH/DELETE | `/api/admin/banners/<id>/` | Admin | Update/delete banner |
| GET/POST | `/api/admin/availability/` | Admin | Manage schedule |
| GET/POST | `/api/admin/blocked-dates/` | Admin | Manage blocked dates |

---

## Payment Flow (Campay)

```
User submits phone → POST /api/payments/campay/collect/
  → Django calls Campay SDK collect()
    → User receives USSD prompt on phone
      → User approves on phone
        → Campay calls POST /api/payments/campay/webhook/
          OR React polls GET /api/payments/campay/status/<ref>/
            → Order marked PAID, stock decremented, cart cleared, email sent
```

**Test numbers (DEV environment):**
- MTN: `677XXXXXX` — auto-approves in DEV mode
- Orange: `699XXXXXX` — auto-approves in DEV mode

---

## Deployment on Render

1. Push to GitHub
2. Connect repo to Render
3. Use `render.yaml` (already configured) via Render Blueprints
4. Add secret env vars in Render dashboard:
   - `CAMPAY_APP_USERNAME`, `CAMPAY_APP_PASSWORD`
   - `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `DEFAULT_FROM_EMAIL`
5. Run seed: `python seed_data.py` in the backend shell

---

## Deployment on Railway

1. Push backend and frontend as separate Railway services
2. Add PostgreSQL plugin
3. Set env vars from the table above
4. Backend: uses `railway.json` + `Dockerfile`
5. Frontend: set `RAILWAY_DOCKERFILE_PATH=frontend/Dockerfile`

---

## Project Structure

```
herbal-medical/
├── backend/
│   ├── apps/
│   │   ├── users/          # Custom user model + JWT auth
│   │   ├── products/       # Products, services, categories
│   │   ├── cart/           # Guest + user cart
│   │   ├── orders/         # Orders, order items, dashboard API
│   │   ├── payments/       # Campay integration
│   │   ├── appointments/   # Booking, availability, slots
│   │   ├── blog/           # Blog posts
│   │   ├── banners/        # Adverts/banners
│   │   ├── certificates/   # Compliance certificates
│   │   ├── reviews/        # Verified product reviews
│   │   └── coupons/        # Discount coupons
│   ├── config/
│   │   ├── settings.py
│   │   └── urls.py
│   ├── seed_data.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── admin/      # 3 custom admin widgets
│       │   └── ...         # Public + auth pages
│       ├── components/     # Shared UI components
│       ├── context/        # Auth + Cart context
│       └── services/api.js # Axios client + all API calls
├── docker-compose.yml
├── render.yaml
└── README.md
```

---

## Admin Access

- **Django Admin** (`/admin/`): Manage all data models directly in the database
- **Custom React Admin** (`/admin` frontend):

| Page | Route | Description |
|---|---|---|
| Dashboard | `/admin` | Revenue charts, booking stats, recent orders/appointments. Stat card icons are configurable. |
| Products | `/admin/products` | Create/edit/delete products with image upload, stock, categories, featured toggle |
| Services | `/admin/services` | Create/edit/delete consultation services with pricing and duration |
| Blog Posts | `/admin/blog` | Rich text editor (react-quill), publish/unpublish, tags, cover image |
| Banner Scheduler | `/admin/banners` | Create/schedule banners for 4 placements: Hero, Shop, Sidebar, Popup |
| Booking Calendar | `/admin/calendar` | Week view, click appointments, block dates |
| About Page | `/admin/about` | Edit hero text, story (Markdown), doctor name/bio/photo |
| Site Settings | `/admin/settings` | Logo, dark logo, favicon, contact details, location, Google Maps, social media links, dashboard icons |
