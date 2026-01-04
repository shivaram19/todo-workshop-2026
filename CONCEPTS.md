# Core Concepts Explained

This document explains the fundamental concepts used in this application for developers who want to understand how everything works under the hood.

## Table of Contents
1. [HTTP and REST APIs](#http-and-rest-apis)
2. [JWT Authentication](#jwt-authentication)
3. [Password Hashing with bcrypt](#password-hashing-with-bcrypt)
4. [Prisma ORM](#prisma-orm)
5. [React Hooks](#react-hooks)
6. [React Context API](#react-context-api)
7. [Express Middleware](#express-middleware)
8. [CORS](#cors)
9. [localStorage](#localstorage)
10. [Async/Await and Promises](#asyncawait-and-promises)

---

## HTTP and REST APIs

### What is HTTP?
HTTP (HyperText Transfer Protocol) is the foundation of data communication on the web. It's a request-response protocol between clients and servers.

**HTTP Request Structure:**
```
POST /api/auth/login HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Authorization: Bearer eyJhbGc...

{
  "email": "user@example.com",
  "password": "mypassword"
}
```

**HTTP Response Structure:**
```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "token": "eyJhbGc...",
  "user": { "id": 1, "email": "user@example.com" }
}
```

### HTTP Methods
- **GET**: Retrieve data (read-only, no side effects)
- **POST**: Create new resource
- **PUT**: Update existing resource (full replacement)
- **PATCH**: Partial update of resource
- **DELETE**: Remove resource

### Status Codes
- **2xx Success**
  - 200 OK: Request succeeded
  - 201 Created: Resource created successfully
- **4xx Client Errors**
  - 400 Bad Request: Invalid input
  - 401 Unauthorized: Authentication required
  - 403 Forbidden: No permission
  - 404 Not Found: Resource doesn't exist
- **5xx Server Errors**
  - 500 Internal Server Error: Server encountered error

### REST Principles
REST (Representational State Transfer) is an architectural style for APIs:

1. **Resource-Based**: Everything is a resource with a unique URI
   - `/api/users/5` - User with ID 5
   - `/api/todos/10` - Todo with ID 10

2. **HTTP Methods Map to Operations**:
   - GET /api/todos - List all todos
   - POST /api/todos - Create new todo
   - PUT /api/todos/5 - Update todo 5
   - DELETE /api/todos/5 - Delete todo 5

3. **Stateless**: Each request contains all information needed
   - No server-side sessions
   - Token included in every request

4. **JSON Format**: Data exchanged as JSON

---

## JWT Authentication

### What is a JWT?
JWT (JSON Web Token) is a compact, URL-safe means of representing claims to be transferred between two parties.

### JWT Structure
A JWT consists of three parts separated by dots:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjV9.L1zPyNJXbFn...
└────────── Header ──────────┘ └─ Payload ─┘ └── Signature ──┘
```

**1. Header** (Base64 encoded):
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```
- `alg`: Algorithm used (HMAC SHA256)
- `typ`: Token type

**2. Payload** (Base64 encoded):
```json
{
  "userId": 5,
  "iat": 1609459200,
  "exp": 1609545600
}
```
- `userId`: Custom claim (our data)
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp

**3. Signature**:
```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

### How JWT Signing Works

**Creating a JWT:**
```javascript
// 1. Create header and payload
const header = { alg: "HS256", typ: "JWT" };
const payload = { userId: 5 };

// 2. Encode to Base64
const encodedHeader = base64(header);
const encodedPayload = base64(payload);

// 3. Create signature
const signature = HMACSHA256(
  encodedHeader + "." + encodedPayload,
  JWT_SECRET
);

// 4. Combine all parts
const token = encodedHeader + "." + encodedPayload + "." + signature;
```

**Verifying a JWT:**
```javascript
// 1. Split token into parts
const [header, payload, signature] = token.split('.');

// 2. Recreate signature using same secret
const expectedSignature = HMACSHA256(
  header + "." + payload,
  JWT_SECRET
);

// 3. Compare signatures
if (signature === expectedSignature) {
  // Token is valid and hasn't been tampered with
  const data = base64Decode(payload); // { userId: 5 }
} else {
  // Token is invalid - reject request
}
```

### Why JWT is Secure

1. **Signature Verification**:
   - Only server with secret key can create valid signatures
   - If someone changes payload, signature won't match
   - Server recreates signature and compares

2. **Stateless**:
   - No database lookup needed to verify token
   - Server doesn't store tokens
   - Scales horizontally (any server can verify)

3. **Tamper-Proof**:
   - Payload is readable (Base64 is not encryption)
   - But any change breaks the signature
   - Can't modify claims without secret key

### JWT Workflow

```
1. User Login
   User → POST /api/auth/login → Server
                                    ↓
                                verify password
                                create JWT
                                sign with secret
                                    ↓
   User ← { token: "eyJ..." } ← Server

2. Store Token
   User → localStorage.setItem('token', token)

3. Authenticated Request
   User → GET /api/todos
          Authorization: Bearer eyJ...
          → Server
              ↓
          verify JWT signature
          extract userId from payload
          filter data by userId
              ↓
   User ← { todos: [...] } ← Server
```

### Token Expiration

JWTs can include an expiration time:

```javascript
// Creating token with expiration
const token = jwt.sign(
  { userId: 5 },
  JWT_SECRET,
  { expiresIn: '24h' }  // Token expires in 24 hours
);
```

When verifying:
```javascript
jwt.verify(token, JWT_SECRET, (err, decoded) => {
  if (err) {
    // Could be expired, invalid signature, malformed, etc.
    return res.status(403).json({ error: 'Invalid token' });
  }
  // Token is valid
});
```

---

## Password Hashing with bcrypt

### Why Hash Passwords?

**The Problem:**
If database is compromised and passwords are stored in plain text:
```
users table:
id | email              | password
1  | alice@example.com  | mypassword123
2  | bob@example.com    | qwerty
```
Attacker gets all passwords immediately!

**The Solution:**
Store hashed passwords:
```
users table:
id | email              | password
1  | alice@example.com  | $2b$10$N9qo8uLO...
2  | bob@example.com    | $2b$10$K2dLw4pO...
```
Attacker can't reverse the hash to get original password.

### How bcrypt Works

**1. Hashing (Signup):**
```javascript
const plainPassword = "mypassword123";

// bcrypt.hash(password, saltRounds)
const hash = await bcrypt.hash(plainPassword, 10);
// Returns: "$2b$10$N9qo8uLOickgx2ZMRZoMy.O4jPKMo5Z5SBTM..."

// Store this hash in database
await prisma.user.create({
  data: { email, password: hash }
});
```

**Under the hood:**
```
1. Generate random salt (22 characters)
   Salt: "N9qo8uLOickgx2ZMRZoMy."

2. Combine password + salt
   Input: "mypassword123N9qo8uLOickgx2ZMRZoMy."

3. Run bcrypt algorithm (2^10 = 1024 iterations)
   This takes ~100ms intentionally

4. Produce hash
   Output: "$2b$10$N9qo8uLOickgx2ZMRZoMy.O4jPKMo5Z5SBTM..."
```

**2. Verification (Login):**
```javascript
const inputPassword = "mypassword123";
const storedHash = "$2b$10$N9qo8uLO..."; // From database

// bcrypt.compare(plainPassword, hash)
const isValid = await bcrypt.compare(inputPassword, storedHash);
// Returns: true or false
```

**Under the hood:**
```
1. Extract salt from stored hash
   Salt from "$2b$10$N9qo8uLO...": "N9qo8uLOickgx2ZMRZoMy."

2. Hash input password with extracted salt
   Hash("mypassword123" + "N9qo8uLOickgx2ZMRZoMy.", 10 rounds)

3. Compare new hash with stored hash
   If they match: password is correct
   If they don't match: password is wrong
```

### bcrypt Hash Format

```
$2b$10$N9qo8uLOickgx2ZMRZoMy.O4jPKMo5Z5SBTM5OxSKBr3EFVaHKxVS
│ │ │  │                      │
│ │ │  │                      └─ Hash (31 chars)
│ │ │  └────────────────────────── Salt (22 chars)
│ │ └───────────────────────────── Cost factor (10)
│ └─────────────────────────────── Minor version (b)
└───────────────────────────────── Algorithm ($2 = bcrypt)
```

### Why bcrypt is Secure

**1. Salt (Prevents Rainbow Tables)**
```
Without salt:
"password" → hash1
"password" → hash1  (same hash every time!)

Attacker creates table:
password  → hash1
123456    → hash2
qwerty    → hash3

Then looks up hash in table to find password.

With salt:
"password" + salt1 → hash1
"password" + salt2 → hash2  (different hashes!)

Rainbow tables useless - would need table for every possible salt.
```

**2. Slow (Prevents Brute Force)**
```
Cost factor 10 = 2^10 = 1024 iterations (~100ms)

Attacker tries to crack password:
- Try "password" → 100ms
- Try "123456" → 100ms
- Try "qwerty" → 100ms

To try 1 million passwords: 100,000 seconds ≈ 28 hours
To try 1 billion passwords: 100 million seconds ≈ 3 years

Compare to simple hash (MD5):
- 1 billion passwords in < 1 second!
```

**3. Adaptive Cost**
```
Current: Cost factor 10 (fine for now)
Future: Computers get faster
Solution: Increase cost factor to 12 or 14

Old hashes still work (cost stored in hash string)
New hashes use higher cost
```

**4. Constant-Time Comparison**
```
Naive string comparison:
"hello" vs "h..." → stops at first mismatch (fast)
"hello" vs "hel..." → checks 3 chars (slower)

Attacker can measure time to figure out partial password!

bcrypt.compare() always takes same time regardless of mismatch position.
```

---

## Prisma ORM

### What is an ORM?

ORM (Object-Relational Mapping) bridges the gap between:
- **Object-Oriented Code** (JavaScript objects)
- **Relational Databases** (SQL tables)

**Without ORM (Raw SQL):**
```javascript
const result = await db.query(
  'SELECT * FROM todos WHERE userId = $1 ORDER BY createdAt DESC',
  [userId]
);
const todos = result.rows;
```

**With ORM (Prisma):**
```javascript
const todos = await prisma.todo.findMany({
  where: { userId },
  orderBy: { createdAt: 'desc' }
});
```

### Prisma Architecture

```
Your Code
   ↓
Prisma Client (generated from schema)
   ↓
Prisma Query Engine
   ↓
PostgreSQL Database
```

### How Prisma Works

**1. Define Schema (schema.prisma):**
```prisma
model Todo {
  id        Int      @id @default(autoincrement())
  title     String
  completed Boolean  @default(false)
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
}
```

**2. Generate Client:**
```bash
npx prisma generate
```

This creates TypeScript types and client methods:
```typescript
// Generated types
interface Todo {
  id: number;
  title: string;
  completed: boolean;
  userId: number;
}

// Generated methods
prisma.todo.create()
prisma.todo.findMany()
prisma.todo.update()
prisma.todo.delete()
```

**3. Use in Code:**
```javascript
const todo = await prisma.todo.create({
  data: {
    title: "Buy milk",
    userId: 5
  }
});
```

**4. Prisma Translates to SQL:**
```sql
INSERT INTO "todos" ("title", "userId", "completed")
VALUES ('Buy milk', 5, false)
RETURNING *;
```

### Prisma Queries Explained

**Create:**
```javascript
const user = await prisma.user.create({
  data: {
    email: "alice@example.com",
    password: hashedPassword
  }
});

// SQL: INSERT INTO users (email, password) VALUES (?, ?) RETURNING *
```

**Find One:**
```javascript
const user = await prisma.user.findUnique({
  where: { email: "alice@example.com" }
});

// SQL: SELECT * FROM users WHERE email = ? LIMIT 1
```

**Find Many:**
```javascript
const todos = await prisma.todo.findMany({
  where: { userId: 5 },
  orderBy: { createdAt: 'desc' }
});

// SQL: SELECT * FROM todos WHERE userId = 5 ORDER BY createdAt DESC
```

**Update:**
```javascript
const todo = await prisma.todo.update({
  where: { id: 10 },
  data: { completed: true }
});

// SQL: UPDATE todos SET completed = true WHERE id = 10 RETURNING *
```

**Delete:**
```javascript
await prisma.todo.delete({
  where: { id: 10 }
});

// SQL: DELETE FROM todos WHERE id = 10
```

### Prisma Relationships

**Schema:**
```prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  todos Todo[]  // One user has many todos
}

model Todo {
  id     Int  @id @default(autoincrement())
  userId Int
  user   User @relation(fields: [userId], references: [id])  // Each todo belongs to one user
}
```

**Query with Relations:**
```javascript
// Get user with all their todos
const userWithTodos = await prisma.user.findUnique({
  where: { id: 5 },
  include: { todos: true }
});

// Result:
{
  id: 5,
  email: "alice@example.com",
  todos: [
    { id: 1, title: "Buy milk", completed: false },
    { id: 2, title: "Walk dog", completed: true }
  ]
}
```

### Benefits of Prisma

1. **Type Safety**: TypeScript knows exact shape of data
2. **Auto-completion**: IDE suggests available fields/methods
3. **SQL Injection Prevention**: Queries are parameterized
4. **Migration Management**: Schema changes tracked
5. **No SQL String Building**: Cleaner, more maintainable code

---

## React Hooks

### What are Hooks?

Hooks let you use React features (state, lifecycle, context) in function components.

### useState

**Purpose**: Add state to functional components

**Basic Usage:**
```javascript
import { useState } from 'react';

function Counter() {
  // Declare state variable
  const [count, setCount] = useState(0);
  //     │      │            │
  //     │      │            └─ Initial value
  //     │      └─ Setter function
  //     └─ Current value

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

**How it works:**
1. First render: `count = 0` (initial value)
2. User clicks button
3. `setCount(1)` called
4. React re-renders component
5. Second render: `count = 1`
6. UI updates to show new count

**Multiple State Variables:**
```javascript
function Form() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Each state is independent
}
```

### useEffect

**Purpose**: Perform side effects (API calls, subscriptions, timers)

**Basic Usage:**
```javascript
import { useEffect } from 'react';

function TodoList() {
  const [todos, setTodos] = useState([]);

  // Runs after component renders
  useEffect(() => {
    fetchTodos();
  }, []); // Empty array = run once on mount

  return <div>{/* render todos */}</div>;
}
```

**Dependency Array:**
```javascript
// No array: runs after every render
useEffect(() => {
  console.log('Every render');
});

// Empty array: runs once on mount
useEffect(() => {
  console.log('Mount only');
}, []);

// With dependencies: runs when dependencies change
useEffect(() => {
  console.log('Count changed:', count);
}, [count]);
```

**Cleanup:**
```javascript
useEffect(() => {
  // Subscribe to something
  const subscription = subscribeToData();

  // Cleanup function (runs before next effect or unmount)
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### useContext

**Purpose**: Access context values without prop drilling

**Usage:**
```javascript
// 1. Create context
const AuthContext = createContext();

// 2. Provide value
function App() {
  return (
    <AuthContext.Provider value={{ user: 'Alice' }}>
      <TodoList />
    </AuthContext.Provider>
  );
}

// 3. Consume value
function TodoList() {
  const { user } = useContext(AuthContext);
  return <div>Hello {user}</div>;
}
```

---

## React Context API

### The Problem: Prop Drilling

```javascript
function App() {
  const user = { name: 'Alice' };

  return <Parent user={user} />;
}

function Parent({ user }) {
  return <Child user={user} />;
}

function Child({ user }) {
  return <Grandchild user={user} />;
}

function Grandchild({ user }) {
  return <div>Hello {user.name}</div>;
}
```

Components in the middle (Parent, Child) don't use `user`, but must pass it down.

### The Solution: Context

```javascript
// 1. Create Context
const UserContext = createContext();

// 2. Provider (top level)
function App() {
  const user = { name: 'Alice' };

  return (
    <UserContext.Provider value={user}>
      <Parent />
    </UserContext.Provider>
  );
}

// 3. Consumers (anywhere in tree)
function Grandchild() {
  const user = useContext(UserContext);
  return <div>Hello {user.name}</div>;
}
```

### How Context Works

```
Provider (holds data)
   └── Component A
         ├── Component B
         │     └── Consumer (useContext) ← gets data
         └── Component C
               └── Consumer (useContext) ← gets data

When value changes → all consumers re-render
```

### Context Best Practices

**1. Custom Hook:**
```javascript
// Instead of:
const auth = useContext(AuthContext);

// Create custom hook:
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Usage:
const { user, login, logout } = useAuth();
```

**2. Separate Concerns:**
```javascript
// Don't: One context for everything
<AppContext.Provider value={{ user, todos, settings, ... }}>

// Do: Multiple focused contexts
<AuthContext.Provider>
  <TodoContext.Provider>
    <SettingsContext.Provider>
      <App />
    </SettingsContext.Provider>
  </TodoContext.Provider>
</AuthContext.Provider>
```

---

## Express Middleware

### What is Middleware?

Middleware functions are functions that have access to the request and response objects and the next middleware function.

**Structure:**
```javascript
function middleware(req, res, next) {
  // Do something
  next(); // Pass to next middleware
}
```

### Middleware Pipeline

```
Request
   ↓
Middleware 1 (CORS)
   ↓
Middleware 2 (Body Parser)
   ↓
Middleware 3 (Auth)
   ↓
Route Handler
   ↓
Response
```

Each middleware can:
1. Execute code
2. Modify req/res objects
3. End request-response cycle
4. Call next() to pass control

### Examples

**1. Logging Middleware:**
```javascript
function logger(req, res, next) {
  console.log(`${req.method} ${req.url}`);
  next(); // Must call next() to continue
}

app.use(logger);
```

**2. Authentication Middleware:**
```javascript
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ error: 'No token' });
    // Don't call next() - end the request here
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    req.userId = decoded.userId; // Modify request object
    next(); // Continue to route handler
  });
}

// Apply to specific routes
router.get('/todos', authenticateToken, (req, res) => {
  // req.userId available here
});
```

**3. Error Handling Middleware:**
```javascript
function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).json({ error: err.message });
}

// Must be last
app.use(errorHandler);
```

### Order Matters!

```javascript
// Wrong order
app.use(routes); // Routes registered first
app.use(bodyParser); // Body parser after routes (too late!)

// Correct order
app.use(bodyParser); // Parse body first
app.use(routes); // Then handle routes
```

---

## CORS

### What is CORS?

CORS (Cross-Origin Resource Sharing) is a security feature that controls which domains can access your API.

### The Same-Origin Policy Problem

```
Frontend: http://localhost:5173
Backend:  http://localhost:3000

These are different origins (different ports)!

Browser blocks requests for security:
Frontend → Backend ✗ Blocked by browser
```

### How CORS Works

**1. Simple Request:**
```
Frontend → GET http://localhost:3000/api/todos
           Origin: http://localhost:5173

Backend → 200 OK
          Access-Control-Allow-Origin: *
          { todos: [...] }

Browser checks header → Origin allowed → Frontend gets response
```

**2. Preflight Request:**
```
For requests with:
- Custom headers (Authorization)
- Methods other than GET/POST
- Content-Type: application/json

Browser sends OPTIONS request first:

Browser → OPTIONS http://localhost:3000/api/todos
          Origin: http://localhost:5173

Backend → 200 OK
          Access-Control-Allow-Origin: *
          Access-Control-Allow-Methods: GET, POST, PUT, DELETE
          Access-Control-Allow-Headers: Authorization

Browser checks → Allowed → Sends actual request
```

### Enabling CORS in Express

```javascript
import cors from 'cors';

// Allow all origins (development only!)
app.use(cors());

// Production: Allow specific origin
app.use(cors({
  origin: 'https://myapp.com'
}));

// Multiple origins
app.use(cors({
  origin: ['https://myapp.com', 'https://admin.myapp.com']
}));
```

---

## localStorage

### What is localStorage?

localStorage is a web API that stores data in the browser with no expiration.

### Basic Operations

```javascript
// Store data
localStorage.setItem('token', 'eyJhbGc...');

// Retrieve data
const token = localStorage.getItem('token');

// Remove data
localStorage.removeItem('token');

// Clear all data
localStorage.clear();
```

### Storing Objects

localStorage only stores strings:

```javascript
// Wrong
localStorage.setItem('user', { id: 5, email: 'alice@example.com' });
// Stored as: "[object Object]"

// Correct
const user = { id: 5, email: 'alice@example.com' };
localStorage.setItem('user', JSON.stringify(user));
// Stored as: '{"id":5,"email":"alice@example.com"}'

// Retrieve
const storedUser = JSON.parse(localStorage.getItem('user'));
```

### localStorage vs sessionStorage vs Cookies

| Feature | localStorage | sessionStorage | Cookies |
|---------|-------------|----------------|---------|
| Expiration | Never | Tab close | Can set |
| Capacity | ~10MB | ~10MB | ~4KB |
| Sent to server | No | No | Yes (automatic) |
| Accessible | JavaScript | JavaScript | JavaScript + Server |
| Scope | Same origin | Same tab | Can set domain |

### Security Considerations

**✗ Don't store sensitive data:**
```javascript
// Bad
localStorage.setItem('password', 'mypassword123');
localStorage.setItem('creditCard', '1234-5678-9012-3456');
```

**✓ OK to store:**
```javascript
// Fine
localStorage.setItem('token', 'eyJhbGc...'); // JWT (already signed)
localStorage.setItem('theme', 'dark');
localStorage.setItem('language', 'en');
```

**XSS Risk:**
If attacker can run JavaScript on your site:
```javascript
// Attacker's script
const token = localStorage.getItem('token');
sendToAttacker(token);
```

**Mitigation:**
- Sanitize user input
- Use Content Security Policy
- httpOnly cookies for highly sensitive data (not accessible to JavaScript)

---

## Async/Await and Promises

### What is Asynchronous Code?

**Synchronous (blocking):**
```javascript
console.log('1');
const result = someSlowFunction(); // Waits 5 seconds
console.log('2');

// Output:
// 1
// (5 second delay)
// 2
```

**Asynchronous (non-blocking):**
```javascript
console.log('1');
someSlowFunction(); // Starts, doesn't wait
console.log('2');

// Output:
// 1
// 2
// (5 seconds later, function completes)
```

### Promises

A Promise represents an eventual result of an async operation.

**Three States:**
1. **Pending**: Operation in progress
2. **Fulfilled**: Operation succeeded (resolved)
3. **Rejected**: Operation failed (error)

**Creating a Promise:**
```javascript
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    const success = true;

    if (success) {
      resolve('Operation succeeded!');
    } else {
      reject('Operation failed!');
    }
  }, 1000);
});
```

**Consuming with .then():**
```javascript
promise
  .then((result) => {
    console.log(result); // "Operation succeeded!"
  })
  .catch((error) => {
    console.error(error);
  });
```

### Async/Await

Async/await is syntactic sugar over Promises.

**Without async/await:**
```javascript
function fetchTodos() {
  getTodos()
    .then((todos) => {
      console.log(todos);
      return createTodo('New todo');
    })
    .then((newTodo) => {
      console.log(newTodo);
    })
    .catch((error) => {
      console.error(error);
    });
}
```

**With async/await:**
```javascript
async function fetchTodos() {
  try {
    const todos = await getTodos();
    console.log(todos);

    const newTodo = await createTodo('New todo');
    console.log(newTodo);
  } catch (error) {
    console.error(error);
  }
}
```

### How async/await Works

**async function:**
- Always returns a Promise
- Can use await inside

```javascript
async function example() {
  return 'hello';
}

// Equivalent to:
function example() {
  return Promise.resolve('hello');
}
```

**await expression:**
- Pauses execution until Promise resolves
- Returns the resolved value
- Can only be used inside async functions

```javascript
async function fetchUser() {
  console.log('1');

  const user = await getUser(5); // Pauses here
  console.log('2', user);

  const todos = await getTodos(user.id); // Pauses here
  console.log('3', todos);
}

// Execution:
// 1
// (wait for getUser)
// 2 { id: 5, email: 'alice@example.com' }
// (wait for getTodos)
// 3 [{ id: 1, title: 'Buy milk' }, ...]
```

### Error Handling

```javascript
async function login(email, password) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error.message);
    throw error; // Re-throw to let caller handle
  }
}
```

### Common Async Patterns

**Sequential (one after another):**
```javascript
const user = await getUser();
const todos = await getTodos(user.id); // Waits for user first
```

**Parallel (at the same time):**
```javascript
const [user, todos] = await Promise.all([
  getUser(),
  getTodos()
]); // Both start immediately
```

**Race (first to finish wins):**
```javascript
const result = await Promise.race([
  fetchFromServer1(),
  fetchFromServer2()
]); // Returns whichever completes first
```

---

This covers the core concepts used throughout the application. Each concept builds on the others to create a secure, scalable full-stack application.
