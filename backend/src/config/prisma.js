// Prisma Client Configuration
// This file creates and exports a singleton instance of PrismaClient

// Import PrismaClient from generated @prisma/client
// PrismaClient is auto-generated based on our schema.prisma file
// It provides type-safe methods to interact with our database
import { PrismaClient } from '@prisma/client';

// Create a single instance of PrismaClient
// PrismaClient manages the connection pool to PostgreSQL database
// It's expensive to create, so we reuse the same instance throughout the app
//
// How PrismaClient works under the hood:
// 1. Establishes connection pool to PostgreSQL using DATABASE_URL
// 2. Provides methods like prisma.user.create(), prisma.todo.findMany(), etc.
// 3. Translates our method calls into SQL queries
// 4. Returns JavaScript objects with full type safety
const prisma = new PrismaClient({
  // Log configuration - shows what SQL queries Prisma is running
  // Useful for debugging and understanding what's happening in the database
  log: ['query', 'info', 'warn', 'error'],
});

// Export the instance so other files can import and use it
// Example usage: import prisma from './config/prisma.js'
export default prisma;
