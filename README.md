# Schedulr — Calendly Clone

Full-stack scheduling app. Next.js 14 + Node.js/Express + PostgreSQL.

## Routes

| Route | Description |
|---|---|
| `/dashboard` | Create / edit / delete event types |
| `/availability` | Set weekly hours + timezone |
| `/meetings` | View upcoming & past, cancel meetings |
| `/alex` | Public profile page (what invitees see) |
| `/alex/30min` | Calendly-style booking calendar |
| `/alex/30min/confirmed` | Booking success page |

---

## Setup (3 steps)

### Step 1 — Prerequisites
- Node.js 18+
- PostgreSQL running locally (or use [Neon](https://neon.tech) free tier)

### Step 2 — Update DATABASE_URL

Open `apps/backend/.env` and set your connection string:

```env
# Local postgres with default password:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/calendly_clone"

# Different password:
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/calendly_clone"

# Neon/Supabase:
DATABASE_URL="postgresql://user:pass@host/dbname?sslmode=require"
```

### Step 3 — Install and run

Terminal 1 (backend):
```bash
cd apps/backend
npm install
npx prisma migrate deploy
node prisma/seed.js
npm run dev
```

Terminal 2 (frontend):
```bash
cd apps/frontend
npm install
npm run dev
```

Open http://localhost:3000

---

## Tech Stack

- **Frontend**: Next.js 14 App Router, Tailwind CSS
- **Backend**: Node.js, Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Email**: Nodemailer (optional — skipped if SMTP not configured)

## Database Schema

```
users          id, name, email, username, timezone
event_types    id, userId, name, slug, duration, color, isActive
availabilities id, userId, dayOfWeek, startTime, endTime, isActive
bookings       id, userId, eventTypeId, inviteeName, inviteeEmail,
               startTime, endTime, timezone, status, cancelReason
```

## Seeded data

- User: Alex Johnson (username: `alex`)
- Event types: 15-min intro, 30-min meeting, 60-min meeting
- Availability: Mon–Fri 9am–5pm Eastern
- 5 sample bookings (3 upcoming, 2 past/cancelled)

## Deployment

**Backend (Render)**
- Root: `apps/backend`
- Build: `npm install && npx prisma generate && npx prisma migrate deploy && node prisma/seed.js`
- Start: `npm start`
- Env: `DATABASE_URL`, `PORT=10000`, `FRONTEND_URL=https://your-app.vercel.app`

**Frontend (Vercel)**
- Root: `apps/frontend`
- Env: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com`

## Assumptions
- Single user system, no auth — default user id is `"default-user-id"`
- Slots computed dynamically at request time
- Email optional — skipped silently if SMTP env vars absent
