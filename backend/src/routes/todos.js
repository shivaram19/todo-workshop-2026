// Todo Routes
// Handles CRUD operations (Create, Read, Update, Delete) for todos

// Import Express Router
import express from 'express';

// Import Prisma client for database operations
import prisma from '../config/prisma.js';

// Import authentication middleware
// This ensures all todo routes are protected and require valid JWT
import { authenticateToken } from '../middleware/auth.js';

// Create router instance
const router = express.Router();

// Apply authentication middleware to ALL routes in this file
// This means every route below will require a valid JWT token
// The middleware extracts userId from token and adds it to req.userId
router.use(authenticateToken);

// GET ALL TODOS
// GET /api/todos
// Returns all todos for the authenticated user
router.get('/', async (req, res) => {
  try {
    // req.userId was set by authenticateToken middleware
    // This ensures users can only see their own todos
    //
    // Prisma's findMany method:
    // - Queries database for multiple records
    // - where clause filters results (similar to SQL WHERE)
    // - orderBy sorts results (newest first in this case)
    // - Returns array of todo objects
    const todos = await prisma.todo.findMany({
      where: {
        userId: req.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Send todos array as JSON response
    res.json(todos);
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// GET SINGLE TODO
// GET /api/todos/:id
// Returns a specific todo by ID (only if it belongs to the user)
router.get('/:id', async (req, res) => {
  try {
    // Extract todo ID from URL parameter
    // Example: /api/todos/5 -> req.params.id = "5"
    // parseInt converts string to number since database ID is integer
    const todoId = parseInt(req.params.id);

    // Validate ID is a valid number
    if (isNaN(todoId)) {
      return res.status(400).json({ error: 'Invalid todo ID' });
    }

    // Find todo by ID AND userId
    // This ensures users can't access other users' todos even if they know the ID
    // findUnique is used when searching by unique identifier(s)
    const todo = await prisma.todo.findUnique({
      where: {
        id: todoId,
      },
    });

    // Check if todo exists
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    // Verify todo belongs to authenticated user
    // Authorization check: even if todo exists, user must own it
    if (todo.userId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(todo);
  } catch (error) {
    console.error('Get todo error:', error);
    res.status(500).json({ error: 'Failed to fetch todo' });
  }
});

// CREATE TODO
// POST /api/todos
// Creates a new todo for the authenticated user
router.post('/', async (req, res) => {
  try {
    // Extract title from request body
    const { title } = req.body;

    // Validation: title is required
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Create new todo in database
    // Prisma's create method:
    // - Inserts new row into todos table
    // - Sets userId to link todo with authenticated user
    // - completed defaults to false (defined in schema)
    // - createdAt and updatedAt automatically set by Prisma
    // - Returns the created todo object including generated ID
    const todo = await prisma.todo.create({
      data: {
        title: title.trim(),
        userId: req.userId,
      },
    });

    // Return created todo with 201 status (Created)
    res.status(201).json(todo);
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

// UPDATE TODO
// PUT /api/todos/:id
// Updates an existing todo (title and/or completed status)
router.put('/:id', async (req, res) => {
  try {
    const todoId = parseInt(req.params.id);
    const { title, completed } = req.body;

    if (isNaN(todoId)) {
      return res.status(400).json({ error: 'Invalid todo ID' });
    }

    // First, check if todo exists and belongs to user
    const existingTodo = await prisma.todo.findUnique({
      where: { id: todoId },
    });

    if (!existingTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    if (existingTodo.userId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Build update data object
    // Only include fields that were provided in request
    // This allows partial updates (update only title, or only completed, or both)
    const updateData = {};
    if (title !== undefined) {
      updateData.title = title.trim();
    }
    if (completed !== undefined) {
      updateData.completed = completed;
    }

    // Update todo in database
    // Prisma's update method:
    // - Finds record by ID
    // - Updates specified fields
    // - Automatically updates updatedAt timestamp
    // - Returns the updated todo object
    const updatedTodo = await prisma.todo.update({
      where: { id: todoId },
      data: updateData,
    });

    res.json(updatedTodo);
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// DELETE TODO
// DELETE /api/todos/:id
// Deletes a specific todo
router.delete('/:id', async (req, res) => {
  try {
    const todoId = parseInt(req.params.id);

    if (isNaN(todoId)) {
      return res.status(400).json({ error: 'Invalid todo ID' });
    }

    // Check if todo exists and belongs to user
    const existingTodo = await prisma.todo.findUnique({
      where: { id: todoId },
    });

    if (!existingTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    if (existingTodo.userId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete todo from database
    // Prisma's delete method:
    // - Removes the record from database
    // - Returns the deleted todo object (for confirmation)
    await prisma.todo.delete({
      where: { id: todoId },
    });

    // Return success message
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

export default router;
