# Architecture Documentation

This document explains the architecture and key concepts of the full-stack todo application.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  React Frontend (Port 5173)                            │ │
│  │  - Components (Auth, TodoList)                         │ │
│  │  - Context (AuthContext)                               │ │
│  │  - API Client (fetch wrapper)                          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP Requests (JSON)
                            │ Authorization: Bearer <JWT>
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Express Backend (Port 3000)                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Routes Layer                                          │ │
│  │  - /api/auth/* (signup, login)                         │ │
│  │  - /api/todos/* (CRUD operations)                      │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Middleware Layer                                      │ │
│  │  - CORS                                                │ │
│  │  - Body Parser                                         │ │
│  │  - JWT Authentication                                  │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Prisma ORM Layer                                      │ │
│  │  - Type-safe database client                           │ │
│  │  - Query builder                                       │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ SQL Queries
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  PostgreSQL Database                                        │
│  - users table                                              │
│  - todos table                                              │
└─────────────────────────────────────────────────────────────┘
```

## Authentication Flow

### 1. Signup Process

```
User → Frontend → Backend → Database → Backend → Frontend → User
                                      ↓
                                   bcrypt hash
                                   generate JWT
```

**Step-by-step:**
1. User enters email and password in signup form
2. Frontend validates input (client-side)
3. Frontend sends POST request to `/api/auth/signup`
4. Backend validates input (server-side)
5. Backend checks if user already exists
6. Backend hashes password using bcrypt (10 rounds)
7. Backend creates user record in database via Prisma
8. Backend generates JWT token containing user ID
9. Backend returns token + user data to frontend
10. Frontend stores token in localStorage
11. Frontend updates React Context with user state
12. App re-renders, showing TodoList component

### 2. Login Process

```
User → Frontend → Backend → Database
                           ↓
                       verify password
                       generate JWT
                           ↓
                Frontend ← Backend
```

**Step-by-step:**
1. User enters credentials
2. Frontend sends POST to `/api/auth/login`
3. Backend finds user by email
4. Backend compares password with bcrypt
5. If valid, backend generates JWT
6. Frontend stores token and updates context
7. App re-renders with authenticated state

### 3. Protected API Request

```
Frontend → Middleware → Route Handler → Database
           ↓
       verify JWT
       extract user ID
```

**Step-by-step:**
1. Frontend includes JWT in Authorization header
2. Backend middleware intercepts request
3. Middleware extracts token from header
4. Middleware verifies token signature
5. Middleware decodes user ID from payload
6. Middleware adds userId to request object
7. Route handler uses userId to filter data
8. Data returned only for that user

## Data Flow

### Creating a Todo

```
1. User types todo title and clicks "Add"
   ↓
2. TodoList component calls handleCreateTodo()
   ↓
3. Component calls api.createTodo(token, title)
   ↓
4. fetch() sends POST to /api/todos with:
   - Authorization header: "Bearer <token>"
   - Body: { title: "Buy milk" }
   ↓
5. Backend authenticateToken middleware:
   - Extracts token from header
   - Verifies JWT signature with secret
   - Decodes userId from payload
   - Adds req.userId = 5
   ↓
6. POST /api/todos route handler:
   - Validates title exists
   - Calls prisma.todo.create({
       data: { title, userId: req.userId }
     })
   ↓
7. Prisma:
   - Generates SQL: INSERT INTO todos (title, userId, completed)
   - Executes query
   - Returns created todo object
   ↓
8. Backend returns JSON: { id: 15, title: "Buy milk", completed: false, userId: 5 }
   ↓
9. Frontend receives response
   ↓
10. TodoList updates state: setTodos([newTodo, ...todos])
   ↓
11. React re-renders, new todo appears in UI
```

### Toggle Todo Completion

```
1. User clicks checkbox
   ↓
2. handleToggleTodo(todo) called
   ↓
3. api.updateTodo(token, todo.id, { completed: !todo.completed })
   ↓
4. PUT /api/todos/:id with token
   ↓
5. Middleware verifies token
   ↓
6. Route handler:
   - Finds todo by ID
   - Verifies todo.userId matches req.userId
   - Updates completed status
   ↓
7. Prisma executes: UPDATE todos SET completed = true WHERE id = 15
   ↓
8. Updated todo returned
   ↓
9. Frontend updates state:
   setTodos(todos.map(t => t.id === todo.id ? updatedTodo : t))
   ↓
10. React re-renders, checkbox and styling update
```

## Key Concepts Explained

### 1. JWT (JSON Web Token)

**Structure:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjV9.signature
└──────────── header ────────────┘└─ payload ─┘└─ signature ─┘
```

**How it works:**
1. Server creates header + payload (user data)
2. Server signs with secret key using HMAC-SHA256
3. Creates signature: HMACSHA256(base64(header) + "." + base64(payload), secret)
4. Combines: header.payload.signature
5. Sends to client
6. Client stores and includes in future requests
7. Server verifies by recreating signature and comparing

**Why it's secure:**
- Signature proves token hasn't been tampered with
- Only server with secret can create valid signatures
- Payload is readable but not modifiable
- If someone changes payload, signature won't match

### 2. bcrypt Password Hashing

**How bcrypt works:**
```
Password: "mypassword123"
          ↓
Generate random salt: "$2b$10$N9qo8uLOickgx2ZMRZoMy."
          ↓
Combine password + salt
          ↓
Run through bcrypt algorithm (2^10 = 1024 rounds)
          ↓
Output hash: "$2b$10$N9qo8uLOickgx2ZMRZoMy.O4jPKMo5Z5SBTM5OxSKBr3EFVaHKxVS"
```

**Format of bcrypt hash:**
```
$2b$10$N9qo8uLOickgx2ZMRZoMy.O4jPKMo5Z5SBTM5OxSKBr3EFVaHKxVS
 │  │  │                      │
 │  │  │                      └── Hash (31 chars)
 │  │  └────────────────────────── Salt (22 chars)
 │  └───────────────────────────── Cost factor (10 = 2^10 rounds)
 └──────────────────────────────── Algorithm version (2b)
```

**Why it's secure:**
- Salt is random and stored in hash (different hash each time)
- Cost factor makes it slow (prevents brute force)
- One-way function (can't reverse to get password)
- Comparison is constant-time (prevents timing attacks)

### 3. Prisma ORM

**Traditional SQL:**
```javascript
const user = await db.query(
  'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *',
  [email, hashedPassword]
);
```

**Prisma:**
```javascript
const user = await prisma.user.create({
  data: { email, password: hashedPassword }
});
```

**Benefits:**
1. **Type Safety**: TypeScript knows what fields exist
2. **Auto-completion**: IDE suggests available methods
3. **Query Building**: No SQL string concatenation
4. **Migrations**: Schema changes tracked and versioned
5. **Relations**: Easy to query related data

**Under the hood:**
1. Prisma reads schema.prisma
2. Generates TypeScript types and client code
3. When you call prisma.user.create():
   - Validates data matches schema
   - Builds SQL query
   - Executes on database
   - Returns typed result

### 4. React Context API

**Problem without Context:**
```
App
└── TodoList (needs user data)
    └── TodoItem (needs user data)
        └── DeleteButton (needs user data)
```

Need to pass user through every component (prop drilling).

**Solution with Context:**
```
AuthProvider (stores user)
└── App
    └── TodoList (useAuth() → gets user)
        └── TodoItem (useAuth() → gets user)
            └── DeleteButton (useAuth() → gets user)
```

Any component can access user directly.

**How it works:**
1. createContext() creates a "tunnel" through component tree
2. Provider component holds the data
3. useContext() hook lets any child component access data
4. When data changes, all consumers re-render

### 5. Express Middleware Pipeline

Middleware functions execute in order:

```
Request → CORS → Body Parser → Custom Middleware → Route Handler → Response
```

**Example request flow:**
```javascript
// 1. CORS middleware
app.use(cors());  // Adds CORS headers

// 2. Body parser
app.use(express.json());  // Parses req.body

// 3. Custom auth middleware (only for protected routes)
router.use(authenticateToken);  // Verifies JWT, adds req.userId

// 4. Route handler
router.get('/todos', async (req, res) => {
  // req.userId is available here
  const todos = await prisma.todo.findMany({
    where: { userId: req.userId }
  });
  res.json(todos);
});
```

**Key concept:**
- Each middleware can:
  - Modify request/response objects
  - Call next() to continue to next middleware
  - Send response and end the chain
  - Throw error to jump to error handler

## Security Architecture

### Defense Layers

**1. Client-Side Validation**
- Immediate feedback to user
- Reduces unnecessary API calls
- Not a security measure (can be bypassed)

**2. Server-Side Validation**
- Real security boundary
- Validates all input regardless of source
- Never trust client

**3. Authentication**
- JWT verifies user identity
- Middleware enforces on protected routes
- Stateless (no session storage needed)

**4. Authorization**
- Verify user owns the data
- Example: `todo.userId === req.userId`
- Prevents users accessing others' data

**5. Database Constraints**
- Foreign keys ensure referential integrity
- Unique constraints prevent duplicates
- NOT NULL prevents missing data

**6. Password Security**
- bcrypt hashing (one-way)
- Salt prevents rainbow table attacks
- Cost factor prevents brute force

## State Management

### Frontend State

**1. Server State (todos)**
- Source of truth: backend database
- Frontend caches in React state
- Refetch on mount
- Optimistic updates for better UX

**2. Auth State**
- Source of truth: localStorage (persisted) + Context (current)
- Restored on page load
- Cleared on logout
- Shared via Context API

**3. UI State (loading, errors)**
- Local to components
- Not persisted
- Reset on unmount

### State Flow

```
Database (persistent)
    ↓ fetch
Backend (stateless)
    ↓ HTTP
Frontend Context (session)
    ↓ useAuth()
Component State (render)
    ↓ render
UI (display)
```

## Performance Considerations

### 1. Database Queries
- Prisma generates efficient SQL
- Index on userId for fast filtering
- orderBy uses database sorting

### 2. Frontend Updates
- Optimistic updates (UI updates before server confirms)
- Array methods create new arrays (React detects changes)
- Context only re-renders consumers, not entire tree

### 3. Token Storage
- localStorage is synchronous (fast)
- JWT verification is fast (< 1ms)
- No database lookup needed for auth

### 4. Password Hashing
- Intentionally slow (security > speed)
- Only on signup/login (not on every request)
- Async to avoid blocking

## Error Handling

### 1. Frontend
- try-catch for API calls
- Error state for display
- Specific error messages

### 2. Backend
- Input validation before database operations
- Try-catch for unexpected errors
- Generic error messages (don't leak info)
- Error middleware catches all

### 3. Database
- Prisma handles connection errors
- Foreign key violations
- Unique constraint violations

## Testing Strategy

### 1. Backend
- Test auth endpoints (signup, login)
- Test protected routes require JWT
- Test authorization (user can't access others' data)
- Test validation (reject invalid input)

### 2. Frontend
- Test form validation
- Test authentication flow
- Test CRUD operations
- Test error handling

### 3. Integration
- Test full flow: signup → create todo → logout → login → see todos
- Test token expiration
- Test invalid token handling

## Scaling Considerations

### Current Architecture (Single Server)
- Good for: < 1000 concurrent users
- Single database connection pool
- All requests to one server

### Horizontal Scaling
- Multiple backend servers behind load balancer
- JWT enables stateless scaling (no session stickiness)
- Shared PostgreSQL database
- Consider connection pooling (PgBouncer)

### Database Scaling
- Read replicas for read-heavy workloads
- Indexing on frequently queried columns
- Pagination for large result sets
- Caching layer (Redis) for hot data

### Frontend Scaling
- CDN for static assets
- Code splitting for smaller bundles
- Lazy loading for routes
- Service worker for offline support

## Future Enhancements

### 1. Features
- Todo categories/tags
- Due dates and reminders
- Sharing todos with other users
- Real-time updates (WebSocket)

### 2. Architecture
- GraphQL instead of REST
- Microservices for different features
- Message queue for async tasks
- Caching layer

### 3. Security
- Rate limiting
- Email verification
- Two-factor authentication
- OAuth social login

### 4. DevOps
- Docker containerization
- CI/CD pipeline
- Monitoring and logging
- Automated backups
