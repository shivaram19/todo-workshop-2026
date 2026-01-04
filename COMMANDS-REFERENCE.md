# Commands Reference Guide

Quick reference for all commands used in this project. Commands are organized by operating system where they differ.

---

## Table of Contents
1. [Node.js & npm](#nodejs--npm)
2. [PostgreSQL](#postgresql)
3. [Prisma](#prisma)
4. [Git](#git)
5. [Project Specific](#project-specific)
6. [Troubleshooting](#troubleshooting)
7. [Testing](#testing)

---

## Node.js & npm

### Check Versions
```bash
# All OS
node --version
npm --version
```

### Install Dependencies
```bash
# All OS - Install from package.json
npm install

# Install specific package
npm install express

# Install as dev dependency
npm install --save-dev prisma

# Install globally
npm install -g typescript
```

### Update Packages
```bash
# Update all packages
npm update

# Update specific package
npm update express

# Check outdated packages
npm outdated
```

### Remove Packages
```bash
# Remove package
npm uninstall express

# Remove and clean
npm uninstall express && npm prune
```

### Clean Install
```bash
# Remove and reinstall everything
rm -rf node_modules package-lock.json
npm install

# Windows PowerShell
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

---

## PostgreSQL

### Installation Check
```bash
# All OS
psql --version
```

### Start/Stop Service

**macOS (Homebrew):**
```bash
# Start
brew services start postgresql@15

# Stop
brew services stop postgresql@15

# Restart
brew services restart postgresql@15

# Check status
brew services list
```

**Linux:**
```bash
# Start
sudo systemctl start postgresql

# Stop
sudo systemctl stop postgresql

# Restart
sudo systemctl restart postgresql

# Check status
sudo systemctl status postgresql

# Enable auto-start on boot
sudo systemctl enable postgresql
```

**Windows:**
```
# Use Services app (Win+R → services.msc)
# Or use Command Prompt as Administrator:

net start postgresql-x64-15
net stop postgresql-x64-15
```

### Database Operations

**Create Database:**
```bash
# Method 1
createdb todo_db

# Method 2 - Using psql
psql -U postgres
CREATE DATABASE todo_db;
\q
```

**Delete Database:**
```bash
# Method 1
dropdb todo_db

# Method 2 - Using psql
psql -U postgres
DROP DATABASE todo_db;
\q
```

**Connect to Database:**
```bash
# macOS/Linux
psql -U postgres -d todo_db

# Windows (or use SQL Shell from Start menu)
psql -U postgres -d todo_db
```

### psql Commands

Inside psql prompt:
```sql
-- List all databases
\l

-- List all tables
\dt

-- Describe table structure
\d "User"
\d "Todo"

-- Switch database
\c todo_db

-- List all users
\du

-- Show current database
SELECT current_database();

-- Show PostgreSQL version
SELECT version();

-- Quit psql
\q
```

### Query Database

```sql
-- View all users
SELECT * FROM "User";

-- View all todos
SELECT * FROM "Todo";

-- Count records
SELECT COUNT(*) FROM "User";
SELECT COUNT(*) FROM "Todo";

-- Get todos for specific user
SELECT * FROM "Todo" WHERE "userId" = 1;

-- Get user with their todos count
SELECT u.email, COUNT(t.id) as todo_count
FROM "User" u
LEFT JOIN "Todo" t ON u.id = t."userId"
GROUP BY u.id, u.email;

-- Delete all todos (for testing)
DELETE FROM "Todo";

-- Delete specific user and their todos (CASCADE)
DELETE FROM "User" WHERE id = 1;
```

---

## Prisma

### Generate Client
```bash
# Generate Prisma Client from schema
npm run prisma:generate

# Or directly
npx prisma generate
```

### Migrations

```bash
# Create and apply migration
npm run prisma:migrate

# Or directly
npx prisma migrate dev --name migration_name

# Check migration status
npx prisma migrate status

# Reset database (WARNING: Deletes all data!)
npx prisma migrate reset

# Apply migrations in production
npx prisma migrate deploy
```

### Prisma Studio
```bash
# Open visual database browser
npm run prisma:studio

# Or directly
npx prisma studio
```

### Other Prisma Commands
```bash
# Format schema file
npx prisma format

# Validate schema
npx prisma validate

# Pull schema from existing database
npx prisma db pull

# Push schema to database (without migration)
npx prisma db push

# Seed database (if seed script exists)
npx prisma db seed
```

---

## Git

### Initialize Repository
```bash
# Initialize git repo
git init

# Add remote
git remote add origin https://github.com/username/repo.git
```

### Basic Commands
```bash
# Check status
git status

# Add files
git add .
git add filename.js

# Commit
git commit -m "Your message"

# Push
git push origin main

# Pull
git pull origin main

# Clone repository
git clone https://github.com/username/repo.git
```

### Branches
```bash
# Create branch
git branch feature-name

# Switch branch
git checkout feature-name

# Create and switch
git checkout -b feature-name

# List branches
git branch

# Delete branch
git branch -d feature-name
```

### View History
```bash
# View commits
git log

# View commits (one line each)
git log --oneline

# View changes
git diff
```

---

## Project Specific

### Backend

**Start Development Server:**
```bash
cd backend
npm run dev

# Runs: node --watch src/index.js
# Server auto-restarts on file changes
```

**Start Production Server:**
```bash
npm run start

# Runs: node src/index.js
```

**Run Prisma Commands:**
```bash
# Generate client
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio
```

### Frontend

**Start Development Server:**
```bash
cd frontend
npm run dev

# Opens at http://localhost:5173
```

**Build for Production:**
```bash
npm run build

# Creates optimized build in dist/
```

**Preview Production Build:**
```bash
npm run preview

# Serves production build locally
```

**Lint Code:**
```bash
npm run lint
```

### Run Both Servers

**Option 1: Two Terminals**
```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```

**Option 2: Background Process (macOS/Linux)**
```bash
# Start backend in background
cd backend && npm run dev &

# Start frontend
cd frontend && npm run dev
```

---

## Troubleshooting

### Find Process on Port

**macOS/Linux:**
```bash
# Find process using port 3000
lsof -ti:3000

# Find with details
lsof -i:3000

# Kill process
kill -9 $(lsof -ti:3000)
```

**Windows PowerShell:**
```powershell
# Find process
Get-NetTCPConnection -LocalPort 3000

# Kill process
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

### Clean Node Modules
```bash
# macOS/Linux
rm -rf node_modules package-lock.json
npm install

# Windows
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

### Clear npm Cache
```bash
npm cache clean --force
npm cache verify
```

### Fix npm Permissions (macOS/Linux)
```bash
# Don't use sudo with npm!
# Instead, configure npm to use a different directory:
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.profile
source ~/.profile
```

### PostgreSQL Not Starting

**macOS:**
```bash
# Check if running
brew services list

# Remove old PID file if stuck
rm /usr/local/var/postgresql@15/postmaster.pid

# Restart
brew services restart postgresql@15
```

**Linux:**
```bash
# Check logs
sudo journalctl -u postgresql -n 50

# Check if already running
ps aux | grep postgres

# Force stop all postgres processes
sudo pkill -9 postgres

# Start fresh
sudo systemctl start postgresql
```

---

## Testing

### API Testing with curl

**Health Check:**
```bash
curl http://localhost:3000/health
```

**Signup:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Get Todos (requires token):**
```bash
curl http://localhost:3000/api/todos \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Create Todo:**
```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"title":"New todo"}'
```

**Update Todo:**
```bash
curl -X PUT http://localhost:3000/api/todos/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"completed":true}'
```

**Delete Todo:**
```bash
curl -X DELETE http://localhost:3000/api/todos/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Windows PowerShell API Testing

**Signup:**
```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/api/auth/signup `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

**Get Todos:**
```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_TOKEN_HERE"
}

Invoke-WebRequest -Uri http://localhost:3000/api/todos `
  -Headers $headers
```

**Create Todo:**
```powershell
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer YOUR_TOKEN_HERE"
}

$body = @{
    title = "New todo"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/api/todos `
  -Method POST `
  -Headers $headers `
  -Body $body
```

---

## Environment Variables

### View Environment Variables

**macOS/Linux:**
```bash
# View all
printenv

# View specific
echo $NODE_ENV
echo $DATABASE_URL
```

**Windows PowerShell:**
```powershell
# View all
Get-ChildItem Env:

# View specific
$env:NODE_ENV
$env:DATABASE_URL
```

### Set Environment Variables Temporarily

**macOS/Linux:**
```bash
# Set for current session
export NODE_ENV=production
export PORT=3001

# Run command with env var
NODE_ENV=production npm start
```

**Windows PowerShell:**
```powershell
# Set for current session
$env:NODE_ENV = "production"
$env:PORT = "3001"
```

---

## File Operations

### Navigate Directories

**All OS:**
```bash
# Change directory
cd backend
cd frontend
cd ..  # Go up one level
cd ~   # Go to home directory

# Print current directory
pwd

# macOS/Linux - List files
ls
ls -la  # Show hidden files and details

# Windows PowerShell
dir
ls
```

### Create Files/Directories

**macOS/Linux:**
```bash
# Create directory
mkdir backend

# Create file
touch index.js

# Create nested directories
mkdir -p backend/src/config
```

**Windows PowerShell:**
```powershell
# Create directory
New-Item -ItemType Directory -Path backend

# Create file
New-Item -ItemType File -Path index.js

# Create nested directories
New-Item -ItemType Directory -Path backend\src\config -Force
```

### View File Contents

**All OS:**
```bash
# View entire file
cat filename.js

# View first 10 lines
head filename.js

# View last 10 lines
tail filename.js

# View with pagination
less filename.js  # Press q to quit
```

---

## Quick Start Commands

### First Time Setup
```bash
# 1. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 2. Create database
createdb todo_db

# 3. Set up environment variables
# Edit backend/.env with your PostgreSQL password

# 4. Run migrations
cd backend
npm run prisma:migrate
# Enter migration name: init

# 5. Generate Prisma client
npm run prisma:generate
```

### Daily Development
```bash
# Terminal 1 - Start backend
cd backend
npm run dev

# Terminal 2 - Start frontend
cd frontend
npm run dev

# Visit http://localhost:5173
```

### Reset Everything
```bash
# Stop all servers (Ctrl+C in terminals)

# Reset database
cd backend
npx prisma migrate reset

# Clean and reinstall
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

---

## Keyboard Shortcuts

### Terminal
- `Ctrl+C` - Stop running process
- `Ctrl+D` - Exit terminal/shell
- `Ctrl+L` - Clear screen
- `Ctrl+R` - Search command history
- `↑/↓` - Navigate command history
- `Tab` - Auto-complete

### Browser DevTools
- `F12` - Open/close DevTools
- `Ctrl+Shift+C` - Inspect element
- `Ctrl+Shift+J` - Open Console
- `Ctrl+]` - Next panel
- `Ctrl+[` - Previous panel

### Code Editor (VS Code)
- `Ctrl+P` - Quick file open
- `Ctrl+Shift+P` - Command palette
- `Ctrl+/` - Toggle comment
- `Ctrl+D` - Select next occurrence
- `Alt+↑/↓` - Move line up/down
- `Ctrl+` - Toggle terminal

---

## Useful Aliases (Optional)

Add to `~/.bashrc`, `~/.zshrc`, or PowerShell profile:

**macOS/Linux:**
```bash
# Navigation
alias ..="cd .."
alias ...="cd ../.."

# Project shortcuts
alias backend="cd ~/path/to/project/backend"
alias frontend="cd ~/path/to/project/frontend"

# Development
alias dev-backend="cd ~/path/to/project/backend && npm run dev"
alias dev-frontend="cd ~/path/to/project/frontend && npm run dev"

# Git shortcuts
alias gs="git status"
alias ga="git add"
alias gc="git commit -m"
alias gp="git push"

# PostgreSQL
alias pgstart="brew services start postgresql@15"
alias pgstop="brew services stop postgresql@15"
alias pgdb="psql -U postgres -d todo_db"
```

**Windows PowerShell:**
```powershell
# Add to $PROFILE file

Function dev-backend { cd path\to\project\backend; npm run dev }
Function dev-frontend { cd path\to\project\frontend; npm run dev }
Function pgdb { psql -U postgres -d todo_db }
```

---

## Remember

- Always run commands from the correct directory
- Backend commands run from `backend/`
- Frontend commands run from `frontend/`
- Some commands need PostgreSQL running
- Use `Ctrl+C` to stop running servers
- Read error messages carefully - they often tell you exactly what's wrong

---

## Getting Help

### Command Help
```bash
# npm help
npm help
npm help install

# Git help
git --help
git commit --help

# psql help
psql --help

# Inside psql
\?  # List all commands
\h  # SQL command help
```

### Check if Services are Running
```bash
# Check if backend is running
curl http://localhost:3000/health

# Check if frontend is running
curl http://localhost:5173

# Check if PostgreSQL is running
psql -U postgres -c "SELECT 1"
```

---

**Pro Tip:** Bookmark this page! You'll reference these commands frequently during development.
