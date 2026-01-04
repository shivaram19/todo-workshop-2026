// Authentication Routes
// Handles user signup and login with JWT generation

// Import Express Router to define route handlers
import express from 'express';

// Import bcryptjs for password hashing
// bcrypt is a cryptographic hash function designed for passwords
// It's "slow by design" to make brute-force attacks impractical
import bcrypt from 'bcryptjs';

// Import jsonwebtoken for creating JWTs
import jwt from 'jsonwebtoken';

// Import Prisma client to interact with database
import prisma from '../config/prisma.js';

// Create router instance
// Router allows us to define routes in separate files and combine them
const router = express.Router();

// SIGNUP ROUTE
// POST /api/auth/signup
// Creates a new user account with email and password
router.post('/signup', async (req, res) => {
  try {
    // Extract email and password from request body
    // Frontend sends: { email: "user@example.com", password: "mypassword" }
    const { email, password } = req.body;

    // Validation: Ensure both fields are provided
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Validation: Ensure password meets minimum length requirement
    // Weak passwords are easily cracked by brute force or dictionary attacks
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    // findUnique queries database for a record with unique field (email)
    // Returns user object if found, null if not found
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash the password using bcrypt
    // Why hash passwords?
    // - Storing plain text passwords is a major security risk
    // - If database is compromised, attackers get all passwords
    // - Hashing is one-way: can't reverse hash to get original password
    //
    // How bcrypt works:
    // 1. Generates a random "salt" (random data added to password)
    // 2. Combines password + salt
    // 3. Runs through bcrypt algorithm multiple times (10 rounds here)
    // 4. Produces a hash string that includes the salt
    // 5. Each hash is unique even for same password (due to random salt)
    //
    // The "10" is the cost factor (number of rounds)
    // Higher = more secure but slower (exponential: 10 = 1024 rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user in database
    // Prisma's create method:
    // 1. Inserts new row into users table
    // 2. Returns the created user object including auto-generated ID
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    // Generate JWT token for the new user
    // jwt.sign creates a token with three parts:
    // 1. Header (algorithm and token type)
    // 2. Payload (the data we want to encode - user ID in this case)
    // 3. Signature (cryptographic signature to verify authenticity)
    //
    // The payload { userId: user.id } will be accessible when token is verified
    // JWT_SECRET is used to create signature - keep this secret and secure!
    // expiresIn: token becomes invalid after 24 hours (forces re-login)
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    // Send success response with token and user info
    // Frontend will store this token and include it in future requests
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    // Catch any unexpected errors (database connection issues, etc.)
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Something went wrong during signup' });
  }
});

// LOGIN ROUTE
// POST /api/auth/login
// Authenticates user and returns JWT token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    // Returns null if user doesn't exist
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Generic error message to prevent email enumeration attacks
      // Don't reveal whether email exists or password is wrong
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password using bcrypt.compare
    // How bcrypt.compare works:
    // 1. Extracts the salt from the stored hash
    // 2. Hashes the provided password with that same salt
    // 3. Compares the new hash with stored hash
    // 4. Returns true if they match, false otherwise
    //
    // This is secure because:
    // - We never decrypt or reverse the stored hash
    // - Timing attacks are mitigated by bcrypt's design
    // - Each comparison takes ~100ms (prevents brute force)
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token (same process as signup)
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    // Send success response
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Something went wrong during login' });
  }
});

// Export router to be used in main app
export default router;
