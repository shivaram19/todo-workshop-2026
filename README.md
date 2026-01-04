# Full-Stack Todo Application

A complete todo application built with React, Express, Prisma ORM, and PostgreSQL. Features user authentication with JWT tokens and full CRUD operations for todos.

## Technology Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **JavaScript (JSX)** - No TypeScript, pure JavaScript
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Prisma ORM** - Database toolkit
- **PostgreSQL** - Database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

## Project Structure

```
project/
├── backend/                 # Express backend
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── src/
│   │   ├── config/
│   │   │   └── prisma.js   # Prisma client configuration
│   │   ├── middleware/
│   │   │   └── auth.js     # JWT authentication middleware
│   │   ├── routes/
│   │   │   ├── auth.js     # Auth endpoints (login/signup)
│   │   │   └── todos.js    # Todo CRUD endpoints
│   │   └── index.js        # Express app entry point
│   ├── .env                # Environment variables
│   └── package.json        # Backend dependencies
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth.jsx        # Login/Signup form
│   │   │   └── TodoList.jsx    # Todo list UI
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx # Authentication state management
│   │   ├── utils/
│   │   │   └── api.js          # API client functions
│   │   ├── App.jsx             # Main app component
│   │   └── main.jsx            # Entry point
│   ├── index.html          # HTML template
│   ├── package.json        # Frontend dependencies
│   └── vite.config.ts      # Vite configuration
│
├── README.md               # Project documentation
├── ARCHITECTURE.md         # Architecture details
└── CONCEPTS.md             # Core concepts explained
```

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Quick Start

For a quick start guide, see [QUICKSTART.md](QUICKSTART.md).

## Setup Instructions

### 1. Database Setup

First, ensure PostgreSQL is installed and running on your machine.

Create a new database:
```bash
createdb todo_db
```

Or using psql:
```bash
psql -U postgres
CREATE DATABASE todo_db;
\q
```

### 2. Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Configure environment variables in `backend/.env`:
```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/todo_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=3000
```

Replace `USERNAME` and `PASSWORD` with your PostgreSQL credentials.

Generate Prisma client and run migrations:
```bash
npm run prisma:generate
npm run prisma:migrate
```

When prompted for migration name, enter something like: `init`

Start the backend server:
```bash
npm run dev
```

The backend should now be running at `http://localhost:3000`

### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

Install frontend dependencies:
```bash
npm install
```

Start the frontend dev server:
```bash
npm run dev
```

The frontend should now be running at `http://localhost:5173`

## How It Works

### Authentication Flow

1. **Signup**:
   - User enters email and password
   - Backend hashes password with bcrypt
   - User record created in database
   - JWT token generated and returned
   - Frontend stores token in localStorage

2. **Login**:
   - User enters credentials
   - Backend verifies password using bcrypt.compare
   - JWT token generated and returned
   - Frontend stores token in localStorage

3. **Protected Routes**:
   - Frontend includes JWT in Authorization header
   - Backend middleware verifies JWT signature
   - If valid, request proceeds; if invalid, 401 error
   - User ID extracted from token to filter data

### Todo Operations

- **Create**: POST /api/todos with title
- **Read**: GET /api/todos (returns user's todos only)
- **Update**: PUT /api/todos/:id (toggle completed or edit title)
- **Delete**: DELETE /api/todos/:id

All todo operations require authentication and users can only access their own todos.

### Key Concepts

#### Prisma ORM
Prisma is a modern database toolkit that:
- Generates database client from schema
- Handles migrations automatically
- Provides intuitive API for queries
- Supports multiple databases

#### JWT Authentication
JSON Web Tokens provide stateless authentication:
- Token contains encoded user data
- Cryptographically signed to prevent tampering
- No session storage needed on server
- Scalable for distributed systems

#### bcrypt Password Hashing
bcrypt is designed for password security:
- One-way hashing (can't be reversed)
- Includes random salt (prevents rainbow table attacks)
- Slow by design (prevents brute force)
- Adaptive cost factor (can increase as computers get faster)

#### React Context API
Context provides global state management:
- Avoids prop drilling through many components
- Single source of truth for authentication state
- Automatic re-renders when state changes
- No external library needed for simple state

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
  - Body: `{ email, password }`
  - Returns: `{ token, user }`

- `POST /api/auth/login` - Authenticate user
  - Body: `{ email, password }`
  - Returns: `{ token, user }`

### Todos (All require Authorization header)
- `GET /api/todos` - Get all todos for current user
- `POST /api/todos` - Create new todo
  - Body: `{ title }`
- `PUT /api/todos/:id` - Update todo
  - Body: `{ title?, completed? }`
- `DELETE /api/todos/:id` - Delete todo

## Database Schema

### User Table
- `id` - Auto-incrementing integer (primary key)
- `email` - Unique string
- `password` - Hashed string
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

### Todo Table
- `id` - Auto-incrementing integer (primary key)
- `title` - String
- `completed` - Boolean (default: false)
- `userId` - Foreign key to User
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

## Development Commands

### Backend (from `backend/` directory)
- `npm run dev` - Start development server with watch mode
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Create and apply migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

### Frontend (from `frontend/` directory)
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Security Considerations

1. **Password Storage**: Never store plain text passwords. bcrypt hashing is mandatory.
2. **JWT Secret**: Use a strong, random secret in production. Never commit to git.
3. **HTTPS**: In production, always use HTTPS to encrypt data in transit.
4. **Input Validation**: Always validate user input on both client and server.
5. **SQL Injection**: Prisma parameterizes queries automatically, preventing SQL injection.
6. **CORS**: Configure CORS properly in production to only allow trusted origins.

## Common Issues

### Database Connection Error
- Verify PostgreSQL is running
- Check DATABASE_URL in .env file
- Ensure database exists and credentials are correct

### JWT Verification Failed
- Check JWT_SECRET matches between token creation and verification
- Ensure token hasn't expired (24h default)
- Verify Authorization header format: "Bearer <token>"

### Prisma Client Not Generated
- Run `npm run prisma:generate` after modifying schema
- Restart backend server after generation

## Production Deployment

1. Set secure JWT_SECRET environment variable
2. Use managed PostgreSQL database (AWS RDS, Heroku Postgres, etc.)
3. Enable HTTPS
4. Build frontend: `npm run build`
5. Serve frontend build with static file server (Nginx, Vercel, etc.)
6. Deploy backend to Node.js hosting (Heroku, Railway, AWS, etc.)
7. Update CORS configuration to allow only your frontend domain

## License

MIT
