# Part 1: Environment Setup

In this part, you'll install all the necessary tools and create the project structure. We'll provide OS-specific instructions for macOS, Windows, and Linux.

**Time Required:** 30-45 minutes

**What You'll Install:**
- Node.js (JavaScript runtime)
- PostgreSQL (database)
- Code editor (VS Code recommended)
- npm packages (libraries for our project)

---

## Table of Contents
1. [Installing Node.js](#installing-nodejs)
2. [Installing PostgreSQL](#installing-postgresql)
3. [Installing a Code Editor](#installing-a-code-editor)
4. [Creating Project Structure](#creating-project-structure)
5. [Verifying Installation](#verifying-installation)

---

## Installing Node.js

Node.js lets you run JavaScript outside the browser. We'll use it for our backend server.

### macOS

**Option 1: Using Official Installer (Recommended for Beginners)**
1. Visit https://nodejs.org/
2. Download the LTS (Long Term Support) version
3. Open the downloaded `.pkg` file
4. Follow the installation wizard
5. Click "Install" and enter your password when prompted

**Option 2: Using Homebrew (If you have it installed)**
```bash
brew install node
```

**Verification:**
```bash
# Check Node.js version
node --version
# Should show something like: v20.x.x

# Check npm version
npm --version
# Should show something like: 10.x.x
```

### Windows

**Option 1: Using Official Installer (Recommended)**
1. Visit https://nodejs.org/
2. Download the LTS version for Windows
3. Run the downloaded `.msi` file
4. Follow the installation wizard
5. Make sure "Add to PATH" is checked
6. Click "Install"
7. Restart your computer after installation

**Option 2: Using Chocolatey (If you have it installed)**
```powershell
# Run PowerShell as Administrator
choco install nodejs-lts
```

**Verification:**
```powershell
# Open PowerShell or Command Prompt
node --version
npm --version
```

### Linux (Ubuntu/Debian)

**Using NodeSource Repository (Recommended)**
```bash
# Update package list
sudo apt update

# Install curl if not already installed
sudo apt install -y curl

# Download and run NodeSource setup script (installs Node.js 20.x)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

**Alternative: Using nvm (Node Version Manager)**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Close and reopen terminal, then:
nvm install --lts
nvm use --lts
```

### Linux (Fedora/RHEL/CentOS)

```bash
# Install Node.js from NodeSource
sudo dnf install -y nodejs

# Or using yum on older versions
sudo yum install -y nodejs

# Verify
node --version
npm --version
```

**Why Node.js?**
Node.js is JavaScript runtime built on Chrome's V8 engine. It allows us to:
- Run JavaScript on the server (not just in browsers)
- Build fast, scalable backend applications
- Use npm (Node Package Manager) to install libraries
- Share code between frontend and backend

---

## Installing PostgreSQL

PostgreSQL is our database where we'll store users and todos.

### macOS

**Option 1: Using Official Installer**
1. Visit https://www.postgresql.org/download/macosx/
2. Download PostgreSQL (version 14 or higher)
3. Run the installer
4. Remember the password you set for the `postgres` user!
5. Default port: 5432 (keep this default)
6. Complete the installation

**Option 2: Using Homebrew**
```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create a database user (if needed)
createuser -s postgres
```

**Option 3: Using Postgres.app (Easiest)**
1. Download from https://postgresapp.com/
2. Move Postgres.app to Applications
3. Open Postgres.app
4. Click "Initialize" to create a new database
5. PostgreSQL is now running!

### Windows

**Using Official Installer (Recommended)**
1. Visit https://www.postgresql.org/download/windows/
2. Download the installer (version 14 or higher)
3. Run the installer
4. Follow the setup wizard:
   - Choose installation directory (default is fine)
   - Select components (install PostgreSQL Server, pgAdmin, Command Line Tools)
   - Set data directory (default is fine)
   - **Set password for postgres user** (REMEMBER THIS!)
   - Port: 5432 (default)
   - Locale: Default
5. Complete installation
6. Uncheck "Launch Stack Builder" and finish

**Important:** Write down your postgres password! You'll need it later.

**Add to PATH (if not automatic):**
1. Search for "Environment Variables" in Windows
2. Click "Environment Variables"
3. Under "System variables", find and edit "Path"
4. Add: `C:\Program Files\PostgreSQL\15\bin` (adjust version if needed)
5. Click OK and restart Command Prompt

### Linux (Ubuntu/Debian)

```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Check status
sudo systemctl status postgresql

# Switch to postgres user
sudo -i -u postgres

# Access PostgreSQL prompt
psql

# Set password for postgres user (inside psql)
\password postgres
# Enter a password you'll remember!

# Exit psql
\q

# Exit postgres user
exit
```

### Linux (Fedora/RHEL/CentOS)

```bash
# Install PostgreSQL
sudo dnf install -y postgresql-server postgresql-contrib

# Or using yum
sudo yum install -y postgresql-server postgresql-contrib

# Initialize database
sudo postgresql-setup --initdb

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Set password
sudo -u postgres psql
\password postgres
\q
```

**Why PostgreSQL?**
PostgreSQL is a powerful, open-source relational database that:
- Stores data in tables with rows and columns
- Supports relationships between data (users have many todos)
- Is reliable, fast, and widely used in production
- Is free and has great tooling

**Testing PostgreSQL:**

```bash
# macOS/Linux - access PostgreSQL
psql -U postgres

# Windows - access PostgreSQL
# Search for "SQL Shell (psql)" in Start menu and open it
# Press Enter for default values, then enter your password

# Inside psql, you should see:
postgres=#

# Try a command:
SELECT version();

# Exit:
\q
```

---

## Installing a Code Editor

You need a code editor to write and edit code files.

### VS Code (Recommended)

**Why VS Code?**
- Free and open-source
- Excellent JavaScript/React support
- Built-in terminal
- Great extensions
- Most popular editor for web development

**macOS:**
1. Visit https://code.visualstudio.com/
2. Download for macOS
3. Open the downloaded file
4. Drag VS Code to Applications folder
5. Open VS Code from Applications

**Windows:**
1. Visit https://code.visualstudio.com/
2. Download for Windows
3. Run the installer
4. Follow installation wizard
5. Check "Add to PATH" during installation
6. Complete installation

**Linux:**
```bash
# Ubuntu/Debian
sudo snap install --classic code

# Or download .deb from website
wget -O code.deb https://code.visualstudio.com/sha/download?build=stable&os=linux-deb-x64
sudo dpkg -i code.deb
sudo apt install -f

# Fedora/RHEL/CentOS
sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc
sudo sh -c 'echo -e "[code]\nname=Visual Studio Code\nbaseurl=https://packages.microsoft.com/yumrepos/vscode\nenabled=1\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc" > /etc/yum.repos.d/vscode.repo'
sudo dnf install code
```

**Recommended VS Code Extensions:**
1. Open VS Code
2. Click the Extensions icon (or press Ctrl+Shift+X)
3. Search and install:
   - **ES7+ React/Redux/React-Native snippets** - Code shortcuts
   - **Prettier - Code formatter** - Auto-format code
   - **ESLint** - Find code problems
   - **Prisma** - Syntax highlighting for Prisma schema

### Alternative Editors

If you prefer something else:
- **Sublime Text** (https://www.sublimetext.com/)
- **Atom** (https://atom-editor.cc/)
- **WebStorm** (paid, but powerful)

---

## Creating Project Structure

Now let's create the folders and files for our project.

### Step 1: Choose a Location

Pick a location for your project:

```bash
# macOS/Linux
cd ~/Desktop
mkdir todo-app-tutorial
cd todo-app-tutorial

# Windows (PowerShell)
cd ~\Desktop
mkdir todo-app-tutorial
cd todo-app-tutorial
```

**Tip:** You can create this anywhere you like! Just remember where you put it.

### Step 2: Create Backend Directory

```bash
# Create backend folder
mkdir backend
cd backend

# Initialize npm project
npm init -y

# This creates package.json file with default settings
```

**What is package.json?**
- Lists all libraries (dependencies) your project needs
- Contains scripts for running your app
- Stores project metadata (name, version, etc.)

### Step 3: Install Backend Dependencies

```bash
# Still in backend/ directory

# Install main dependencies
npm install express cors bcryptjs jsonwebtoken dotenv @prisma/client

# Install Prisma as dev dependency
npm install --save-dev prisma
```

**What did we just install?**
- **express** - Web framework for building our API
- **cors** - Allows frontend to talk to backend
- **bcryptjs** - Hashes passwords securely
- **jsonwebtoken** - Creates authentication tokens
- **dotenv** - Loads environment variables
- **@prisma/client** - Database client
- **prisma** - Database toolkit and CLI

**This might take a few minutes!** npm is downloading code from the internet.

### Step 4: Create Backend File Structure

```bash
# Still in backend/ directory

# Create folders
mkdir src
mkdir src/config
mkdir src/middleware
mkdir src/routes
mkdir prisma

# Create files (macOS/Linux)
touch src/index.js
touch src/config/prisma.js
touch src/middleware/auth.js
touch src/routes/auth.js
touch src/routes/todos.js
touch prisma/schema.prisma
touch .env

# Windows (PowerShell) - use these commands instead
New-Item -ItemType File -Path src/index.js
New-Item -ItemType File -Path src/config/prisma.js
New-Item -ItemType File -Path src/middleware/auth.js
New-Item -ItemType File -Path src/routes/auth.js
New-Item -ItemType File -Path src/routes/todos.js
New-Item -ItemType File -Path prisma/schema.prisma
New-Item -ItemType File -Path .env
```

**Your backend structure should now look like:**
```
backend/
├── node_modules/        (created by npm install)
├── prisma/
│   └── schema.prisma
├── src/
│   ├── config/
│   │   └── prisma.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── todos.js
│   └── index.js
├── .env
├── package.json
└── package-lock.json
```

### Step 5: Configure package.json

Open `backend/package.json` in your editor and modify it:

```json
{
  "name": "todo-backend",
  "version": "1.0.0",
  "type": "module",
  "description": "Express backend with Prisma ORM for todo application",
  "main": "src/index.js",
  "scripts": {
    "dev": "node --watch src/index.js",
    "start": "node src/index.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "dotenv": "^16.3.1",
    "@prisma/client": "^5.8.0"
  },
  "devDependencies": {
    "prisma": "^5.8.0"
  }
}
```

**What changed?**
- Added `"type": "module"` - Allows us to use modern ES6 import/export syntax
- Added scripts for running the server and Prisma commands

### Step 6: Set Up Environment Variables

Open `backend/.env` and add:

```env
# Database connection string
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/todo_db?schema=public"

# JWT secret key (used for authentication)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server port
PORT=3000
```

**IMPORTANT: Replace `YOUR_PASSWORD` with your actual PostgreSQL password!**

**What is .env file?**
- Stores sensitive configuration (passwords, API keys)
- Not committed to Git (stays on your computer)
- Keeps secrets out of code

**Understanding the DATABASE_URL:**
```
postgresql://postgres:YOUR_PASSWORD@localhost:5432/todo_db?schema=public
           └──user─┘ └─password─┘ └─host─┘ └port┘ └database┘
```
- **postgres** - username
- **YOUR_PASSWORD** - your PostgreSQL password
- **localhost** - database is on your computer
- **5432** - default PostgreSQL port
- **todo_db** - our database name (we'll create this)

### Step 7: Create Database

Now let's create the actual database:

```bash
# macOS/Linux
createdb todo_db

# Or using psql
psql -U postgres
CREATE DATABASE todo_db;
\q

# Windows
# Open SQL Shell (psql) from Start menu
# Press Enter for defaults, enter password
CREATE DATABASE todo_db;
\q
```

**Verify database exists:**
```bash
# List all databases
psql -U postgres -c "\l"

# You should see todo_db in the list
```

### Step 8: Navigate Back and Create Frontend

```bash
# Go back to project root
cd ..

# Create frontend with Vite
npm create vite@latest frontend -- --template react

# Follow the prompts:
# ✔ Select a framework: › React
# ✔ Select a variant: › JavaScript

# Navigate into frontend
cd frontend

# Install dependencies
npm install

# Install additional packages
npm install lucide-react
```

**What is Vite?**
- Modern build tool for frontend development
- Very fast development server with hot reload
- Optimizes code for production
- Alternative to Create React App (but faster!)

### Step 9: Verify Frontend Structure

```bash
# Your complete project structure:
todo-app-tutorial/
├── backend/
│   ├── node_modules/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── index.js
│   ├── .env
│   ├── package.json
│   └── package-lock.json
│
└── frontend/
    ├── node_modules/
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── ... (other Vite files)
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## Verifying Installation

Let's make sure everything is set up correctly!

### Test 1: Node.js and npm

```bash
node --version
# Should show: v18.x.x or v20.x.x

npm --version
# Should show: 9.x.x or 10.x.x
```

### Test 2: PostgreSQL

```bash
# Test connection
psql -U postgres -d todo_db -c "SELECT version();"

# Should show PostgreSQL version information
```

### Test 3: Backend Dependencies

```bash
cd backend
npm list --depth=0

# Should show all installed packages without errors
```

### Test 4: Frontend Dependencies

```bash
cd ../frontend
npm list --depth=0

# Should show React, Vite, etc.
```

### Test 5: Start Vite Dev Server (Quick Test)

```bash
# In frontend directory
npm run dev

# Should start server and show:
# VITE v5.x.x  ready in Xms
# ➜  Local:   http://localhost:5173/
```

Open http://localhost:5173/ in your browser. You should see the default Vite + React page!

**Press Ctrl+C to stop the server.**

---

## Common Issues and Solutions

### Issue: `command not found: node`

**Solution:**
- Make sure Node.js installed successfully
- Restart your terminal
- On Windows, restart your computer
- Check PATH environment variable includes Node.js

### Issue: `command not found: psql`

**Solution (macOS/Linux):**
```bash
# Add PostgreSQL to PATH
echo 'export PATH="/usr/local/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**Solution (Windows):**
- Add PostgreSQL bin directory to PATH (see PostgreSQL installation section)

### Issue: Cannot connect to PostgreSQL

**Solution:**
```bash
# macOS/Linux - Check if PostgreSQL is running
sudo systemctl status postgresql

# macOS with Homebrew
brew services list

# Start if not running
sudo systemctl start postgresql
# or
brew services start postgresql@15

# Windows - Check services
# Press Win+R, type services.msc
# Find PostgreSQL service and start it
```

### Issue: `npm install` fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Try again
npm install
```

### Issue: Permission denied errors (Linux/macOS)

**Solution:**
```bash
# Don't use sudo with npm!
# Fix npm permissions:
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.profile
source ~/.profile
```

### Issue: Port 3000 or 5173 already in use

**Solution:**
```bash
# Find and kill process using port (macOS/Linux)
lsof -ti:3000 | xargs kill -9
lsof -ti:5173 | xargs kill -9

# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process
```

---

## Checkpoint

At this point, you should have:
- [ ] Node.js and npm installed and working
- [ ] PostgreSQL installed and running
- [ ] Code editor (VS Code) installed
- [ ] Backend directory with dependencies installed
- [ ] Frontend directory created with Vite
- [ ] Database `todo_db` created
- [ ] Environment variables configured in `.env`
- [ ] All verification tests passed

**Stuck?** Review the troubleshooting section above or check that you followed all steps in order.

---

## What's Next?

Congratulations! Your development environment is ready. In **Part 2**, we'll:
- Define our database schema with Prisma
- Understand relationships between users and todos
- Run our first database migration
- Explore the database with Prisma Studio

Take a break, grab some water, and when you're ready, open **TUTORIAL-PART-2-DATABASE.md**!

---

## Quick Reference

**Start PostgreSQL:**
```bash
# macOS (Homebrew)
brew services start postgresql@15

# Linux
sudo systemctl start postgresql

# Windows
# Start menu → Services → PostgreSQL → Start
```

**Access PostgreSQL:**
```bash
# macOS/Linux
psql -U postgres

# Windows
# Start menu → SQL Shell (psql)
```

**Navigate project:**
```bash
# Go to backend
cd ~/Desktop/todo-app-tutorial/backend

# Go to frontend
cd ~/Desktop/todo-app-tutorial/frontend
```

**Check if processes are running:**
```bash
# Check Node processes
ps aux | grep node

# Check PostgreSQL
ps aux | grep postgres
```

Keep this Part 1 open for reference as you continue!
