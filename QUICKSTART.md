# Quick Start Guide

This guide will help you get the full-stack todo application running quickly.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher) installed and running
- Two terminal windows

## Step 1: Database Setup

Create the PostgreSQL database:

```bash
createdb todo_db
```

Or using psql:
```bash
psql -U postgres
CREATE DATABASE todo_db;
\q
```

## Step 2: Backend Setup

**Terminal 1 - Backend:**

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Configure environment variables (edit backend/.env)
# Update DATABASE_URL with your PostgreSQL credentials
# DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/todo_db?schema=public"

# Generate Prisma client and run migrations
npm run prisma:generate
npm run prisma:migrate
# When prompted, enter migration name: init

# Start backend server
npm run dev
```

Backend will run at: `http://localhost:3000`

## Step 3: Frontend Setup

**Terminal 2 - Frontend:**

```bash
# Navigate to frontend folder (from project root)
cd frontend

# Install dependencies
npm install

# Start frontend dev server
npm run dev
```

Frontend will run at: `http://localhost:5173`

## Step 4: Use the Application

1. Open your browser to `http://localhost:5173`
2. Click "Need an account? Sign up"
3. Enter email and password to create account
4. Start adding todos!

## Project Structure

```
project/
├── backend/          # Express + Prisma backend (port 3000)
│   ├── src/         # Source code
│   ├── prisma/      # Database schema
│   └── package.json # Backend dependencies
│
├── frontend/        # React + Vite frontend (port 5173)
│   ├── src/         # React components
│   └── package.json # Frontend dependencies
│
└── README.md        # Full documentation
```

## Common Issues

**Database connection error:**
- Make sure PostgreSQL is running
- Check DATABASE_URL in backend/.env
- Verify database exists: `psql -l | grep todo_db`

**Backend won't start:**
- Make sure you ran `npm run prisma:generate`
- Check that port 3000 is available
- Look for errors in terminal output

**Frontend can't connect to backend:**
- Make sure backend is running on port 3000
- Check browser console for errors
- Verify API_URL in frontend/src/utils/api.js

## Development Commands

**Backend (from backend/ directory):**
- `npm run dev` - Start with watch mode
- `npm run prisma:studio` - Open database GUI
- `npm run prisma:migrate` - Create new migration

**Frontend (from frontend/ directory):**
- `npm run dev` - Start dev server
- `npm run build` - Build for production

## Next Steps

- Read [README.md](README.md) for full documentation
- Check [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- Review [CONCEPTS.md](CONCEPTS.md) for detailed explanations

Happy coding!
