# Part 2: Database Setup with Prisma

In this part, you'll learn about databases, define your data schema, and set up Prisma ORM to interact with PostgreSQL.

**Time Required:** 30-45 minutes

**What You'll Learn:**
- What is an ORM and why use it
- How to define database schemas
- Database relationships (one-to-many)
- Running migrations
- Exploring data with Prisma Studio

---

## Table of Contents
1. [Understanding Databases and ORMs](#understanding-databases-and-orms)
2. [Defining the Schema](#defining-the-schema)
3. [Running Migrations](#running-migrations)
4. [Setting Up Prisma Client](#setting-up-prisma-client)
5. [Testing with Prisma Studio](#testing-with-prisma-studio)

---

## Understanding Databases and ORMs

### What is a Database?

Think of a database like a digital filing cabinet:
- **Tables** are like folders (e.g., "Users" folder, "Todos" folder)
- **Rows** are like individual documents (e.g., one user, one todo)
- **Columns** are like fields on a form (e.g., email, password, title)

**Example - Users Table:**
| id  | email              | password (hashed) | createdAt           |
|-----|--------------------|--------------------|---------------------|
| 1   | alice@example.com  | $2b$10$abc...     | 2024-01-01 10:00:00 |
| 2   | bob@example.com    | $2b$10$def...     | 2024-01-02 11:00:00 |

**Example - Todos Table:**
| id  | title              | completed | userId | createdAt           |
|-----|--------------------|-----------|--------|---------------------|
| 1   | Buy groceries      | false     | 1      | 2024-01-01 10:30:00 |
| 2   | Write code         | true      | 1      | 2024-01-01 11:00:00 |
| 3   | Go for a run       | false     | 2      | 2024-01-02 12:00:00 |

**Relationships:**
- User with id=1 (Alice) has 2 todos (ids 1 and 2)
- User with id=2 (Bob) has 1 todo (id 3)
- The `userId` column creates this link (called a "foreign key")

### What is SQL?

SQL (Structured Query Language) is how we talk to databases:

```sql
-- Get all todos for user with id=1
SELECT * FROM todos WHERE userId = 1;

-- Create a new todo
INSERT INTO todos (title, completed, userId)
VALUES ('Buy milk', false, 1);

-- Update a todo
UPDATE todos SET completed = true WHERE id = 1;

-- Delete a todo
DELETE FROM todos WHERE id = 1;
```

**Problem:** Writing SQL directly is:
- Tedious and error-prone
- Easy to make security mistakes (SQL injection)
- Hard to work with in JavaScript (different syntax)
- No type safety or autocomplete

### What is an ORM?

ORM stands for **Object-Relational Mapping**. It's a bridge between your JavaScript code and the database.

**Without ORM (Raw SQL):**
```javascript
const result = await db.query(
  'SELECT * FROM todos WHERE userId = $1',
  [userId]
);
// Result is just raw data, no type checking
```

**With ORM (Prisma):**
```javascript
const todos = await prisma.todo.findMany({
  where: { userId: userId }
});
// TypeScript knows what fields exist!
// Autocomplete works!
// No SQL injection possible!
```

### Why Prisma?

Prisma is a modern ORM with amazing features:

1. **Type Safety**: TypeScript knows your database structure
2. **Auto-completion**: Your editor suggests available fields and methods
3. **Migration System**: Track database changes over time
4. **Intuitive API**: Reads like English
5. **No SQL Knowledge Required**: (but you'll learn it through Prisma!)
6. **Prisma Studio**: Visual database browser (like a GUI for your data)

---

## Defining the Schema

The schema is where we define what our data looks like.

### Navigate to Backend

```bash
# Make sure you're in the backend directory
cd backend

# Or from project root:
cd todo-app-tutorial/backend
```

### Open the Prisma Schema File

Open `prisma/schema.prisma` in your code editor.

### Add the Schema Definition

Replace the entire contents with:

```prisma
// Prisma Schema Definition
// This file defines the data models and their relationships for our application
// Prisma will use this to generate the database schema and type-safe client

// Generator Configuration
// This tells Prisma to generate a JavaScript/TypeScript client for database operations
// The client provides type-safe methods to interact with the database
generator client {
  provider = "prisma-client-js"
}

// Datasource Configuration
// Defines which database we're using (PostgreSQL) and how to connect to it
// The connection URL is stored in .env file for security
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User Model
// Represents a user in our application who can create and manage todos
// Each field maps to a column in the 'users' table in PostgreSQL
model User {
  // @id: Marks this as the primary key (unique identifier for each user)
  // @default(autoincrement()): Automatically generates incrementing numbers (1, 2, 3...)
  id       Int      @id @default(autoincrement())

  // @unique: Ensures no two users can have the same email (enforced at database level)
  email    String   @unique

  // Stores the hashed password (never store plain text passwords!)
  // We use bcrypt to hash passwords before storing them
  password String

  // @default(now()): Automatically sets to current timestamp when user is created
  // Useful for tracking when accounts were created
  createdAt DateTime @default(now())

  // @updatedAt: Prisma automatically updates this whenever the user record changes
  // Useful for tracking last modification time
  updatedAt DateTime @updatedAt

  // Relationship: One user can have many todos
  // This creates a one-to-many relationship between User and Todo
  // The 'todos' field is virtual (not stored in database) - it's for Prisma queries only
  todos    Todo[]
}

// Todo Model
// Represents a single todo item created by a user
model Todo {
  // Primary key with auto-increment
  id          Int      @id @default(autoincrement())

  // The actual todo text/description
  title       String

  // Whether the todo is completed or not
  // @default(false): New todos are incomplete by default
  completed   Boolean  @default(false)

  // Foreign Key: Links this todo to a specific user
  // This is the actual column stored in the database
  userId      Int

  // Relationship: Each todo belongs to one user
  // @relation: Defines the relationship between Todo and User models
  // fields: [userId] - The field in THIS model that stores the foreign key
  // references: [id] - The field in the OTHER model (User) that this references
  // onDelete: Cascade - If a user is deleted, automatically delete all their todos
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Timestamps for tracking creation and modification
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Understanding Each Part

**Generator Block:**
```prisma
generator client {
  provider = "prisma-client-js"
}
```
- Tells Prisma to generate a JavaScript client
- This creates the code we'll use to interact with the database
- Generated files go into `node_modules/@prisma/client`

**Datasource Block:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
- Specifies PostgreSQL as our database
- `env("DATABASE_URL")` loads connection string from `.env` file
- Keeps secrets out of code

**Data Types:**
- `Int` - Whole numbers (1, 2, 3...)
- `String` - Text ("hello", "user@example.com")
- `Boolean` - true or false
- `DateTime` - Timestamps (2024-01-01 10:00:00)

**Attributes:**
- `@id` - Primary key (unique identifier)
- `@unique` - No duplicates allowed
- `@default()` - Automatic value if not provided
- `@relation` - Links to another model
- `@updatedAt` - Auto-updates on changes

**Relationships:**
```prisma
model User {
  todos Todo[]  // User has many todos
}

model Todo {
  userId Int
  user   User @relation(fields: [userId], references: [id])
  // Todo belongs to one user
}
```

This creates a **one-to-many** relationship:
- One user can have many todos
- Each todo belongs to one user

**Why `onDelete: Cascade`?**
```prisma
user User @relation(fields: [userId], references: [id], onDelete: Cascade)
```
- If we delete a user, automatically delete their todos
- Prevents orphaned data (todos without a user)
- Maintains data integrity

---

## Running Migrations

Migrations are snapshots of your database structure. They track changes over time.

### What is a Migration?

Think of migrations like Git commits for your database:
- Each migration is a change to your database structure
- They can be applied to any database to recreate the structure
- They're reversible (you can roll back)
- They document how your schema evolved

### Generate the Prisma Client

First, generate the Prisma client from your schema:

```bash
# In backend directory
npm run prisma:generate
```

**What this does:**
- Reads `schema.prisma`
- Generates TypeScript types and client code
- Creates `node_modules/@prisma/client`
- Now you can import and use Prisma in your code!

**You should see:**
```
✔ Generated Prisma Client to ./node_modules/@prisma/client
```

### Create and Run the Migration

Now let's create our database tables:

```bash
npm run prisma:migrate

# You'll be prompted:
# ? Enter a name for the new migration: › init
```

Type `init` (or `initial_schema`) and press Enter.

**What this does:**
1. Creates a new migration file in `prisma/migrations/`
2. Generates SQL to create the tables
3. Applies the SQL to your database
4. Updates Prisma's migration history

**You should see:**
```
Applying migration `init`

The following migrations have been applied:

migrations/
  └─ 20240101000000_init/
    └─ migration.sql

Your database is now in sync with your schema.
```

### What Just Happened?

Prisma created these tables in PostgreSQL:

**Users table:**
```sql
CREATE TABLE "User" (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Todos table:**
```sql
CREATE TABLE "Todo" (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  "userId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);
```

### Verify Tables Were Created

```bash
# Connect to database
psql -U postgres -d todo_db

# List all tables
\dt

# You should see:
#  Schema |  Name  | Type  |  Owner
# --------+--------+-------+----------
#  public | User   | table | postgres
#  public | Todo   | table | postgres

# See User table structure
\d "User"

# See Todo table structure
\d "Todo"

# Exit
\q
```

---

## Setting Up Prisma Client

Now let's create a reusable Prisma client for our application.

### Create the Prisma Config File

Open `src/config/prisma.js` and add:

```javascript
// Prisma Client Configuration
// This file creates and exports a single Prisma client instance
// Used throughout the application to interact with the database

// Import PrismaClient class from generated client
// This was created when we ran "prisma generate"
import { PrismaClient } from '@prisma/client';

// Create a new Prisma client instance
// This represents our connection to the database
// It provides methods like prisma.user.create(), prisma.todo.findMany(), etc.
//
// Configuration options you can add:
// - log: ['query'] - Log all SQL queries (useful for debugging)
// - errorFormat: 'pretty' - Better error messages
const prisma = new PrismaClient();

// Export the client so other files can import and use it
// By creating a single instance, we reuse the database connection
// This is more efficient than creating a new client for every request
export default prisma;
```

**Why create a separate file?**
- **Single Instance**: One connection pool for entire app
- **Reusability**: Import anywhere you need database access
- **Consistency**: All code uses same configuration
- **Testing**: Easy to mock in tests

### Understanding PrismaClient

Once you have a Prisma client, you can do things like:

```javascript
// Create a user
const user = await prisma.user.create({
  data: {
    email: 'test@example.com',
    password: 'hashed_password'
  }
});

// Find all todos for a user
const todos = await prisma.todo.findMany({
  where: { userId: 1 }
});

// Update a todo
const updated = await prisma.todo.update({
  where: { id: 1 },
  data: { completed: true }
});

// Delete a todo
await prisma.todo.delete({
  where: { id: 1 }
});
```

**Prisma Methods:**
- `create()` - Insert new record
- `findMany()` - Get multiple records
- `findUnique()` - Get one record by unique field
- `findFirst()` - Get first matching record
- `update()` - Modify existing record
- `delete()` - Remove record
- `count()` - Count records
- `upsert()` - Update if exists, create if not

---

## Testing with Prisma Studio

Prisma Studio is a visual database browser - like phpMyAdmin but modern!

### Launch Prisma Studio

```bash
# In backend directory
npm run prisma:studio
```

**You should see:**
```
Environment variables loaded from .env
Prisma Studio is up on http://localhost:5555
```

### Explore Your Database

1. Open http://localhost:5555 in your browser
2. You'll see two models: **User** and **Todo**
3. Click on **User** - it's currently empty
4. Click on **Todo** - also empty

### Create a Test User

1. Click on **User** in the left sidebar
2. Click **Add record** button
3. Fill in:
   - **email**: `test@example.com`
   - **password**: `temporary_password` (we'll use real hashing later)
   - Leave other fields (Prisma sets them automatically)
4. Click **Save 1 change**

You've created your first user!

### Create a Test Todo

1. Click on **Todo** in the left sidebar
2. Click **Add record**
3. Fill in:
   - **title**: `Learn Prisma`
   - **completed**: false (uncheck if checked)
   - **userId**: 1 (the user we just created)
4. Click **Save 1 change**

### View the Relationship

1. Go back to **User**
2. Click on the test user you created
3. Expand the **todos** field
4. You'll see the todo we created linked to this user!

This demonstrates the **one-to-many relationship** working!

### Create More Test Data

Practice by creating:
- Another user
- Multiple todos for each user
- Try toggling completed status

**Note:** When we build authentication, we'll create users properly with hashed passwords. For now, this is just for testing.

### Stop Prisma Studio

When you're done exploring:
- Go back to terminal
- Press **Ctrl+C** to stop Prisma Studio

---

## Understanding Prisma Workflow

Let's recap the Prisma workflow:

### 1. Define Schema
```prisma
// prisma/schema.prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  // ...
}
```

### 2. Generate Client
```bash
npm run prisma:generate
```
Creates TypeScript types and Prisma client code.

### 3. Create Migration
```bash
npm run prisma:migrate
```
Generates SQL and applies to database.

### 4. Use in Code
```javascript
import prisma from './config/prisma.js';

const user = await prisma.user.create({ /* ... */ });
```

### 5. Visualize with Studio
```bash
npm run prisma:studio
```
Browse and edit data visually.

---

## Common Prisma Patterns

### Find User by Email
```javascript
const user = await prisma.user.findUnique({
  where: { email: 'test@example.com' }
});

if (!user) {
  console.log('User not found');
}
```

### Get User with Their Todos
```javascript
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: { todos: true }
});

// user.todos is an array of todo objects
```

### Create Todo for User
```javascript
const todo = await prisma.todo.create({
  data: {
    title: 'Buy groceries',
    userId: 1
  }
});
```

### Get All Incomplete Todos
```javascript
const todos = await prisma.todo.findMany({
  where: {
    completed: false,
    userId: 1
  },
  orderBy: {
    createdAt: 'desc'
  }
});
```

### Update Multiple Todos
```javascript
await prisma.todo.updateMany({
  where: { completed: true },
  data: { completed: false }
});
```

### Delete User and Their Todos
```javascript
// Because of onDelete: Cascade, todos are deleted automatically
await prisma.user.delete({
  where: { id: 1 }
});
```

---

## Troubleshooting

### Error: Can't reach database server

**Cause:** PostgreSQL is not running.

**Solution:**
```bash
# macOS (Homebrew)
brew services start postgresql@15

# Linux
sudo systemctl start postgresql

# Windows - Start PostgreSQL service from Services app
```

### Error: Database 'todo_db' does not exist

**Solution:**
```bash
# Create the database
createdb todo_db

# Or using psql
psql -U postgres
CREATE DATABASE todo_db;
\q
```

### Error: Authentication failed for user "postgres"

**Cause:** Wrong password in `.env` file.

**Solution:**
- Open `backend/.env`
- Check `DATABASE_URL` has correct password
- Make sure there are no spaces around the password

### Error: Cannot find module '@prisma/client'

**Solution:**
```bash
# Generate Prisma client
npm run prisma:generate

# Or reinstall
npm install @prisma/client
```

### Warning: Prisma Client is out of sync

**Solution:**
```bash
# Regenerate client after schema changes
npm run prisma:generate
```

### Error: Migration failed

**Solution:**
```bash
# Reset database (WARNING: Deletes all data!)
npx prisma migrate reset

# Then create migration again
npm run prisma:migrate
```

---

## Best Practices

### 1. Always Use Migrations

**Don't:**
```bash
# Modifying database directly
psql -U postgres -d todo_db
ALTER TABLE "User" ADD COLUMN name TEXT;
```

**Do:**
```bash
# 1. Update schema.prisma
# 2. Create migration
npm run prisma:migrate
```

### 2. Descriptive Migration Names

**Bad:**
```bash
migration1
update
changes
```

**Good:**
```bash
init
add_user_email_index
add_todo_categories
rename_title_to_description
```

### 3. Use Prisma Studio for Debugging

When something doesn't work:
1. Open Prisma Studio
2. Check if data exists
3. Verify relationships are correct
4. Test queries manually

### 4. Keep Schema Organized

```prisma
// Group related fields
model User {
  // IDs
  id Int @id @default(autoincrement())

  // User data
  email String @unique
  password String

  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  todos Todo[]
}
```

### 5. Use Meaningful Default Values

```prisma
model Todo {
  completed Boolean @default(false)  // New todos uncompleted
  priority Int @default(0)           // Default priority
  archived Boolean @default(false)   // Not archived by default
}
```

---

## Schema Evolution Example

As your app grows, you might add fields:

```prisma
// Version 1 - Simple todo
model Todo {
  id        Int      @id @default(autoincrement())
  title     String
  completed Boolean  @default(false)
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
}

// Version 2 - Add due date
model Todo {
  // ... existing fields ...
  dueDate DateTime?  // Optional field
}

// Version 3 - Add categories
model Todo {
  // ... existing fields ...
  category String @default("personal")
}
```

Each change requires a new migration:
```bash
npm run prisma:migrate  # Migration: add_due_date
npm run prisma:migrate  # Migration: add_category
```

---

## Checkpoint

At this point, you should have:
- [ ] Prisma schema defined in `schema.prisma`
- [ ] Prisma client generated (`npm run prisma:generate`)
- [ ] Migration created and applied (`npm run prisma:migrate`)
- [ ] Prisma client config in `src/config/prisma.js`
- [ ] Tables created in PostgreSQL database
- [ ] Test data created in Prisma Studio
- [ ] Understanding of how Prisma works

**Verify:**
```bash
# List tables
psql -U postgres -d todo_db -c "\dt"

# Should show User and Todo tables

# Check Prisma client exists
ls node_modules/@prisma/client
# Should show generated files
```

---

## What's Next?

Excellent work! You now have a fully functional database with Prisma ORM set up.

In **Part 3**, we'll:
- Build the Express server
- Create authentication endpoints (signup/login)
- Implement JWT authentication
- Build todo CRUD operations
- Connect everything together

Take a break, and when ready, open **TUTORIAL-PART-3-BACKEND.md**!

---

## Quick Reference

**Prisma Commands:**
```bash
# Generate client (after schema changes)
npm run prisma:generate

# Create and apply migration
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio

# Reset database (deletes all data!)
npx prisma migrate reset

# Check migration status
npx prisma migrate status

# View schema
cat prisma/schema.prisma
```

**Common Queries:**
```javascript
// Create
await prisma.user.create({ data: { email, password } });

// Find one
await prisma.user.findUnique({ where: { email } });

// Find many
await prisma.todo.findMany({ where: { userId } });

// Update
await prisma.todo.update({ where: { id }, data: { completed: true } });

// Delete
await prisma.todo.delete({ where: { id } });

// Include relations
await prisma.user.findUnique({
  where: { id },
  include: { todos: true }
});
```

Keep this open for reference!
