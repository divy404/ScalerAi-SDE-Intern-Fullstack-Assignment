#!/bin/bash
echo "Setting up Calendly Clone..."

# Install backend deps
echo "Installing backend dependencies..."
cd apps/backend && npm install

# Install frontend deps
echo "Installing frontend dependencies..."
cd ../frontend && npm install

cd ../..

echo ""
echo "✅ Dependencies installed!"
echo ""
echo "Next steps:"
echo "1. Create apps/backend/.env with your DATABASE_URL"
echo "2. Create apps/frontend/.env.local with NEXT_PUBLIC_API_URL"
echo "3. Run: cd apps/backend && npx prisma migrate dev --name init"
echo "4. Run: cd apps/backend && npm run seed"
echo "5. Run backend: cd apps/backend && npm run dev"
echo "6. Run frontend: cd apps/frontend && npm run dev"
