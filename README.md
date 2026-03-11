# Graze & Grain

## Project Overview
Graze & Grain is a full-stack restaurant platform with:
- Public brand website (`/`, `/menu`, `/about`)
- Public table reservation page (`/reservations`)
- Protected admin dashboard (`/admin/*`)
- NestJS + PostgreSQL API with JWT auth, file upload, soft-delete flows, and reservation acknowledgement

## Live URLs
- Frontend (Vercel): `https://<your-project>.vercel.app`
- Backend (Render): `https://<your-service>.onrender.com`
- Health: `https://<your-service>.onrender.com/health`

## Architecture
- `frontend/`: Next.js 16 (App Router) + Tailwind, consumes backend APIs only (no hardcoded menu/category data)
- `backend/`: NestJS modules (`AuthModule`, `CategoriesModule`, `MenuItemsModule`, `UploadModule`, `AppModule`)
- `backend/prisma`: Prisma schema + migration + seed script
- Storage: local disk uploads (`/uploads/:filename`) with safe filename validation

## Tech Stack Rationale
- Next.js + Tailwind: fast page composition, SSR/CSR mix for public/admin pages, responsive UI
- NestJS: modular backend with guards, DTO validation, global filters, and clean controller/service boundaries
- PostgreSQL: relational integrity, strong indexing support, and safe numeric/constraint handling for pricing/menu data
- Prisma: schema-first DB modeling, migration workflow, typed queries
- JWT: stateless admin authentication suitable for dashboard APIs

## Database Design + Required Answers
### Entities
- `AdminUser`: UUID PK, unique email, bcrypt hash, role enum, `is_active`, timestamps
- `MenuCategory`: serial PK, slug unique, `display_order > 0`, `is_active`, timestamps
- `MenuItem`: serial PK, FK to category (`ON DELETE RESTRICT`), unique slug, price `NUMERIC(8,2)`, availability/featured/deleted flags, timestamps

### Why PostgreSQL?
PostgreSQL provides strict relational constraints, transactional safety, mature indexing, and native numeric precision for prices.

### Why UUID for admin users?
Admin IDs are non-sequential and hard to enumerate, safer for auth-domain identifiers exposed through tokens or logs.

### Why `NUMERIC(8,2)`?
It guarantees exact decimal math (no float rounding), supports prices up to `999,999.99`, and enforces 2 decimal places.

### How soft delete works
- Menu items are never hard-deleted in normal flows.
- `DELETE /menu-items/:id` sets `is_deleted = true`.
- Public queries always filter `is_deleted = false`.

### What indexes are created?
- Unique `slug` on categories and menu items
- Case-insensitive unique index on category name: `UNIQUE (LOWER(name))`
- Composite menu index: `(category_id, is_deleted, is_available)`
- Menu item name index
- FK index via relational key + `ON DELETE RESTRICT`

### What if a category is deleted with active items?
Category delete endpoint performs soft deactivation only (`is_active = false`) and blocks deactivation when active available items exist.

### How schema changes for multi-location?
Add `Location` entity and `location_id` on categories/items (or join tables), scope unique keys by location (for example `(location_id, LOWER(name))`), and add location-aware inventory/availability tables.

## API Summary Table
| Area | Endpoint | Notes |
|---|---|---|
| Auth | `POST /auth/login` | Returns JWT access token |
| Auth | `GET /auth/profile` | Protected, returns admin profile |
| Categories | `GET /categories` | Active categories ordered by display order |
| Categories | `GET /categories/:id` | Category with non-deleted menu items |
| Categories | `POST /categories` | Protected create |
| Categories | `PATCH /categories/:id` | Protected update/toggle active |
| Categories | `DELETE /categories/:id` | Protected soft deactivate |
| Menu Items | `GET /menu-items` | Paginated, searchable, sortable, filterable |
| Menu Items | `GET /menu-items/featured` | Max 6 featured items |
| Menu Items | `GET /menu-items/:id` | Single public item |
| Menu Items | `POST /menu-items` | Protected multipart create |
| Menu Items | `PATCH /menu-items/:id` | Protected multipart update |
| Menu Items | `PATCH /menu-items/:id/availability` | Protected availability toggle |
| Menu Items | `DELETE /menu-items/:id` | Protected soft delete |
| Upload | `POST /upload/image` | Protected, max 5MB, jpg/png/webp |
| Upload | `GET /uploads/:filename` | Safe file serving |
| Reservations | `POST /reservations` | Public table reservation request |
| Reservations | `GET /reservations` | Protected paginated admin list |
| Reservations | `PATCH /reservations/:id/acknowledge` | Protected admin acknowledgement |
| System | `GET /health` | Health check |

## Running Locally
1. Start Postgres:
   - `docker compose up -d postgres`
2. Backend setup:
   - `cd backend`
   - `cp .env.example .env`
   - Update env values
   - `npm install`
   - `npx prisma migrate dev`
   - `npx tsx prisma/seed.ts`
   - `npm run start:dev`
3. Frontend setup:
   - `cd frontend`
   - `npm install`
   - create `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:3000`
   - `npm run dev`

## Environment Variables
```env
# Backend (.env)
DATABASE_URL=postgresql://user:password@host:5432/graze_db
JWT_SECRET=your-secret-here
JWT_EXPIRES_IN=7d
UPLOAD_DEST=./uploads
MAX_FILE_SIZE_MB=5
PORT=3001
CORS_ORIGIN=https://your-frontend.vercel.app
```

```env
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://your-backend.render.com
```

## Deployment Notes
### Backend (Render Blueprint)
- File included: [`render.yaml`](render.yaml)
- Create service from Blueprint in Render.
- It provisions:
  - Node web service (`backend`)
  - PostgreSQL database
  - persistent disk mounted at `/opt/render/project/uploads`
- Render env vars to set/verify:
  - `CORS_ORIGIN=https://<your-project>.vercel.app`
  - `JWT_SECRET` (auto-generated by blueprint, rotate if needed)
- After first deploy, run:
  - `npx prisma migrate deploy`
  - `npx tsx prisma/seed.ts`

### Frontend (Vercel)
- File included: [`frontend/vercel.json`](frontend/vercel.json)
- Import `frontend` folder as a Vercel project.
- Set environment variable:
  - `NEXT_PUBLIC_API_URL=https://<your-service>.onrender.com`
- Redeploy after env var is set.

### Production Checklist
- Backend responds `200` on `/health`.
- Frontend calls only deployed backend URL (no localhost).
- CORS allows only deployed frontend URL.
- Uploads persist across deploy restarts (Render disk path configured).
- HTTPS works on both frontend and backend.
- README Live URLs updated with real links before submission.

## Bonus Features
- Health endpoint (`GET /health`)
- Slug auto-generation with collision handling
- Docker Compose for local PostgreSQL
- GitHub Actions CI (`.github/workflows/ci.yml`)

## Known Limitations
- Refresh-token flow is not implemented yet (single access token only).
- Upload storage is local disk by default (S3 not yet wired).
- Live URLs are placeholders until deployment is completed.

## Future Enhancements
1. Add refresh token + token revocation flow.
2. Integrate Swagger/OpenAPI with auth-protected docs.
3. Add login rate limiting and brute-force protection.
4. Move uploads to S3-compatible object storage.
5. Add CI pipeline (lint, tests, build) with GitHub Actions.
6. Add multi-location schema and inventory support.

## Self-Reflection
- Strength: core API modules and data constraints are structured around integrity and maintainability.
- Strength: UI requirements were implemented functionally with dynamic data and protected admin routes.
- Gap: deployment automation and CI should be completed earlier to reduce last-mile risk.
- Gap: auth can be improved with refresh tokens and stricter session lifecycle controls.

## Admin Credentials (Seed)
- Email: `admin@example.com`
- Password: `password`
