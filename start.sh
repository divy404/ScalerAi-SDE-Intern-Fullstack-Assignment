#!/bin/bash
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}"
echo "  ┌─────────────────────────────────┐"
echo "  │   Schedulr — Calendly Clone     │"
echo "  │         Setup & Start           │"
echo "  └─────────────────────────────────┘"
echo -e "${NC}"

# ── Check .env ───────────────────────────────────────────────────
if [ ! -f "apps/backend/.env" ]; then
  echo -e "${RED}ERROR: apps/backend/.env not found.${NC}"
  echo "Copy apps/backend/.env.example to apps/backend/.env and fill in DATABASE_URL"
  exit 1
fi

# ── Install deps ─────────────────────────────────────────────────
echo -e "${YELLOW}[1/4] Installing dependencies...${NC}"
cd apps/backend && npm install --silent
cd ../frontend && npm install --silent
cd ../..
echo -e "${GREEN}✓ Dependencies installed${NC}"

# ── DB migrate + seed ─────────────────────────────────────────────
echo -e "${YELLOW}[2/4] Running database migrations...${NC}"
cd apps/backend
npx prisma migrate deploy
echo -e "${GREEN}✓ Migrations applied${NC}"

echo -e "${YELLOW}[3/4] Seeding database...${NC}"
node prisma/seed.js
echo -e "${GREEN}✓ Database seeded${NC}"
cd ../..

# ── Start both servers ────────────────────────────────────────────
echo -e "${YELLOW}[4/4] Starting servers...${NC}"
echo ""
echo -e "${GREEN}  Backend  → http://localhost:5001${NC}"
echo -e "${GREEN}  Frontend → http://localhost:3000${NC}"
echo -e "${GREEN}  Booking  → http://localhost:3000/alex${NC}"
echo ""

# Start backend in background
cd apps/backend && npm run dev &
BACKEND_PID=$!

# Start frontend
cd ../frontend && npm run dev &
FRONTEND_PID=$!

# Trap Ctrl+C to kill both
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'; exit 0" SIGINT SIGTERM

wait $BACKEND_PID $FRONTEND_PID
