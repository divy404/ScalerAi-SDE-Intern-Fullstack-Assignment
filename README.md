# 📅 Schedulr — Calendly Clone

> A full-stack scheduling application built as part of the Scaler AI SDE Intern Fullstack Assignment.  
> Replicates core Calendly functionality: event type management, availability configuration, public booking pages, and calendar-based slot selection.

---

## 🚀 Live Demo

| Service | URL |
|---|---|
| Frontend | [https://scaler-ai-sde-intern-fullstack-assi.vercel.app](https://scaler-ai-sde-intern-fullstack-assi.vercel.app) |
| Backend API | [https://calendly-clone-backend-kfnk.onrender.com](https://calendly-clone-backend-kfnk.onrender.com) |
| Public Booking | [https://scaler-ai-sde-intern-fullstack-assi.vercel.app/alex](https://scaler-ai-sde-intern-fullstack-assi.vercel.app/alex) |
| Sample Booking Flow | [https://scaler-ai-sde-intern-fullstack-assi.vercel.app/alex/30min](https://scaler-ai-sde-intern-fullstack-assi.vercel.app/alex/30min) |

> ⚠️ **Note:** Backend is hosted on Render free tier — first request may take ~30s if the server has spun down due to inactivity.

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), React 18, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **ORM** | Prisma 5 |
| **Database** | PostgreSQL |
| **API Client** | Axios |
| **Date/Time** | date-fns, date-fns-tz |
| **Email** | Nodemailer (optional — graceful no-op if SMTP not configured) |
| **Dev Tools** | Nodemon |

---

## ✅ Features Implemented

### Core Requirements
- ✅ **Event Types CRUD** — Create, read, update, delete, and toggle-active event types
- ✅ **Availability Settings** — Per-day-of-week time windows (Mon–Sun), timezone support
- ✅ **Public Booking Page** — Username-based public profile (`/[username]`) listing all active event types
- ✅ **Calendar-based Slot Selection** — Date picker with disabled unavailable days, dynamic available slots
- ✅ **Real-time Slot Calculation** — Server computes slots on-demand respecting availability + existing bookings
- ✅ **Double-Booking Prevention** — Overlap check at book-time; returns 409 if slot was just taken
- ✅ **Booking Confirmation Page** — Success screen with full meeting details
- ✅ **Meetings Dashboard** — Tabs for Upcoming / Past / Cancelled meetings; cancel with reason

### Bonus Features
- ✅ **Responsive Design** — Mobile, tablet, and desktop layouts via Tailwind CSS
- ✅ **Email Notifications** — Booking confirmation & cancellation emails via Nodemailer (non-blocking)
- ✅ **Timezone-aware Slot Generation** — Slots computed in host's timezone, cross-day overlap handled correctly
- ✅ **One-command startup** — `start.sh` installs deps, migrates DB, seeds, and starts both servers
- ✅ **Unique public booking links** — Every event type gets a `/{username}/{slug}` URL

---

## 🗂️ Project Structure

```
calendly-clone/
├── apps/
│   ├── backend/
│   │   ├── prisma/
│   │   │   ├── schema.prisma        # DB models: User, EventType, Availability, Booking
│   │   │   ├── seed.js              # Seeds demo user + event types + bookings
│   │   │   └── migrations/          # Prisma migration history
│   │   └── src/
│   │       ├── index.js             # Express app entry point, CORS, route mounting
│   │       ├── config.js            # Centralised env config
│   │       ├── routes/
│   │       │   ├── public.js        # GET/POST public booking endpoints
│   │       │   ├── eventTypes.js    # CRUD for event types
│   │       │   ├── availability.js  # CRUD for availability windows
│   │       │   └── bookings.js      # Meetings list + cancel
│   │       └── utils/
│   │           ├── slotCalculator.js # Core slot generation logic (timezone-aware)
│   │           ├── email.js          # Nodemailer wrappers (booking + cancel emails)
│   │           └── prisma.js         # Prisma client singleton
│   └── frontend/
│       └── src/
│           ├── app/
│           │   ├── (admin)/
│           │   │   ├── dashboard/   # Event type management
│           │   │   ├── availability/ # Availability settings
│           │   │   └── meetings/    # Meetings list (upcoming/past/cancel)
│           │   └── [username]/
│           │       ├── page.js      # Public profile page
│           │       └── [slug]/
│           │           ├── page.js  # Calendar + slot picker + booking form
│           │           └── confirmed/ # Booking success page
│           ├── components/
│           │   ├── Sidebar.js       # Navigation sidebar (admin layout)
│           │   ├── EventTypeCard.js # Card component for event types
│           │   └── EventTypeModal.js # Create/edit modal for event types
│           └── lib/
│               └── api.js           # Axios instance + all API helper functions
├── start.sh                         # One-command setup + start script
├── setup.sh                         # DB-only setup helper
└── package.json                     # Root workspace config
```

---

## 🗄️ Database Schema

```prisma
model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  username  String   @unique          // drives public URL: /{username}
  timezone  String   @default("UTC")
  eventTypes    EventType[]
  availabilities Availability[]
  bookings       Booking[]
}

model EventType {
  id          String   @id @default(uuid())
  userId      String
  name        String
  slug        String                   // drives booking URL: /{username}/{slug}
  duration    Int                      // minutes
  description String?
  color       String   @default("#0069ff")
  isActive    Boolean  @default(true)
  @@unique([userId, slug])
}

model Availability {
  id        String   @id @default(uuid())
  userId    String
  dayOfWeek Int                        // 0=Sun … 6=Sat
  startTime String                     // "HH:mm"
  endTime   String                     // "HH:mm"
  isActive  Boolean  @default(true)
  @@unique([userId, dayOfWeek])
}

model Booking {
  id            String        @id @default(uuid())
  userId        String
  eventTypeId   String
  inviteeName   String
  inviteeEmail  String
  startTime     DateTime
  endTime       DateTime
  timezone      String
  notes         String?
  status        BookingStatus @default(CONFIRMED)   // CONFIRMED | CANCELLED
  cancelReason  String?
  @@index([userId, startTime])   // fast upcoming-meeting queries
  @@index([userId, status])      // fast tab filtering
}
```

---

## ⚙️ API Reference

### Public Booking Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/public/:username` | User profile + active event types + available days |
| `GET` | `/api/public/:username/:slug` | Event type details + available days |
| `GET` | `/api/public/:username/:slug/slots?date=YYYY-MM-DD` | Available time slots for a given date |
| `POST` | `/api/public/:username/:slug/book` | Create a booking (with conflict check) |

### Admin Endpoints (no auth — single user system)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/event-types` | List all event types |
| `POST` | `/api/event-types` | Create event type |
| `PATCH` | `/api/event-types/:id` | Update event type |
| `DELETE` | `/api/event-types/:id` | Delete event type |
| `PATCH` | `/api/event-types/:id/toggle` | Toggle active/inactive |
| `GET` | `/api/availability` | Get all availability windows |
| `PUT` | `/api/availability` | Bulk upsert availability |
| `GET` | `/api/bookings` | List meetings (filter: `?status=upcoming\|past\|cancelled`) |
| `PATCH` | `/api/bookings/:id/cancel` | Cancel a booking with reason |

---

## 🧠 Slot Calculation Logic

The core scheduling logic lives in `apps/backend/src/utils/slotCalculator.js`:

1. **Timezone conversion** — The requested date is converted to the host's timezone using `date-fns-tz` to determine the correct day-of-week (avoids UTC date-boundary errors)
2. **Availability window** — Start/end times for that day-of-week are parsed in the host's timezone and converted to UTC
3. **Slot iteration** — Slots are generated every `duration` minutes within the window
4. **Conflict detection** — Each slot is checked against existing confirmed bookings using strict overlap logic:  
   `slotStart < bookingEnd && slotEnd > bookingStart`
5. **Past filtering** — Any slot with a start time in the past is excluded
6. **Return format** — Array of ISO 8601 UTC strings, displayed to the invitee in their local time

The slot query also uses a **wide overlap window** (entire calendar day) to correctly catch bookings that span midnight.

---

## 🛠️ Quick Start (One Command)

### Prerequisites
- Node.js 18+
- PostgreSQL running locally (or [Neon](https://neon.tech) free tier)

### Step 1 — Configure the backend

```bash
cp apps/backend/.env.example apps/backend/.env
```

Edit `apps/backend/.env` and set your connection string:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/calendly_clone"
PORT=5001
FRONTEND_URL="http://localhost:3000"

# Optional — email notifications (skip if not needed)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Step 2 — Run the startup script

```bash
chmod +x start.sh
./start.sh
```

This single script will:
1. Install all npm dependencies (backend + frontend)
2. Run Prisma migrations (`prisma migrate deploy`)
3. Seed the database with a demo user and sample data
4. Start the backend on **:5001** and frontend on **:3000** concurrently

> **Ctrl+C** gracefully stops both servers.

### Manual Setup (Alternative)

**Terminal 1 — Backend:**
```bash
cd apps/backend
npm install
npx prisma migrate deploy
node prisma/seed.js
npm run dev          # nodemon, restarts on file change
```

**Terminal 2 — Frontend:**
```bash
cd apps/frontend
npm install
npm run dev
```

---

## 🌱 Seed Data

The seed script (`prisma/seed.js`) creates:

| Resource | Details |
|---|---|
| **User** | Alex Johnson · `username: alex` · timezone: `America/New_York` |
| **Event Types** | 15-min Intro Call, 30-min Meeting, 60-min Strategy Call |
| **Availability** | Mon–Fri, 9:00 AM – 5:00 PM Eastern |
| **Bookings** | 5 sample bookings (3 upcoming confirmed, 1 past, 1 cancelled) |

Access the demo flow at: **[https://scaler-ai-sde-intern-fullstack-assi.vercel.app/alex](https://scaler-ai-sde-intern-fullstack-assi.vercel.app/alex)**

---

## 🌍 Deployment

### Backend → Render

| Setting | Value |
|---|---|
| Root Directory | `apps/backend` |
| Build Command | `npm install && npx prisma generate` |
| Start Command | `npx prisma migrate deploy && npx prisma db seed && node src/index.js` |
| Environment Variables | `DATABASE_URL`, `PORT=5001`, `FRONTEND_URL=https://scaler-ai-sde-intern-fullstack-assi.vercel.app` |
| Live URL | [https://calendly-clone-backend-kfnk.onrender.com](https://calendly-clone-backend-kfnk.onrender.com) |

### Frontend → Vercel

| Setting | Value |
|---|---|
| Root Directory | `apps/frontend` |
| Framework | Next.js (auto-detected) |
| Environment Variables | `NEXT_PUBLIC_API_URL=https://calendly-clone-backend-kfnk.onrender.com` |
| Live URL | [https://scaler-ai-sde-intern-fullstack-assi.vercel.app](https://scaler-ai-sde-intern-fullstack-assi.vercel.app) |

---

## 📐 Design Decisions & Assumptions

| Decision | Rationale |
|---|---|
| Single-user, no auth | Scoped per assignment spec — one pre-seeded user serves as the host |
| Slots computed at request time | Ensures real-time accuracy; avoids stale pre-computed data |
| Availability stored as `"HH:mm"` strings | Simpler than full `DateTime` while supporting all time expressions |
| Email is non-blocking | `sendBookingConfirmation().catch(console.error)` — email failures never break the booking flow |
| Timezone stored on User | Host timezone drives slot calculation; invitee timezone is stored on the booking for display |
| Slug uniqueness scoped to userId | Allows different users to have same slug names independently |
| Prisma double-upsert on availability | `PUT /api/availability` bulk-updates the entire week in one request, deleting removed days |

---

## 🤖 AI Tools Disclosure

AI assistants were used during development for scaffolding, debugging complex timezone edge cases, and refining slot calculation logic. All generated code was reviewed, understood, and adapted to fit the assignment requirements.

---

## 📁 Application Pages

| Route | Who sees it | Description |
|---|---|---|
| `/dashboard` | Host (admin) | Create, edit, delete, and toggle event types |
| `/availability` | Host (admin) | Configure weekly hours and timezone |
| `/meetings` | Host (admin) | View upcoming and past bookings; cancel with reason |
| `/[username]` | Invitee (public) | Profile page — lists all active event types |
| `/[username]/[slug]` | Invitee (public) | Calendar picker → time slot selection → booking form |
| `/[username]/[slug]/confirmed` | Invitee (public) | Booking confirmation with full meeting details |
