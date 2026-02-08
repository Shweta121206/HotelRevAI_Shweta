const express = require('express');
const jwt = require('jsonwebtoken');
const { auth, db, hasFirebaseConfig } = require('../config/firebase');
const { verifyToken, requireFirebase } = require('../middleware/auth');

const router = express.Router();

// In-memory user store for demo (replace with database in production)
const users = [
  {
    id: '1',
    email: 'demo@hotel.com',
    password: 'demo123',
    name: 'Demo Manager',
    hotelName: 'Demo Hotel',
    createdAt: new Date().toISOString()
  }
];
const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-key';

// Helper function to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

/**
 * POST /api/auth/register
 * Register a new hotel manager
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, hotelName } = req.body;

    // Validate input
    if (!email || !password || !name || !hotelName) {
      return res.status(400).json({
        error: 'Missing required fields: email, password, name, hotelName'
      });
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists with this email'
      });
    }

    // Create user
    const user = {
      id: Date.now().toString(),
      email,
      password, // In production, hash this!
      name,
      hotelName,
      createdAt: new Date().toISOString()
    };

    users.push(user);

    res.status(201).json({
      message: 'Hotel manager registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        hotelName: user.hotelName
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * POST /api/auth/login
 * Login hotel manager
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // For demo purposes, accept any email/password
    const user = {
      id: 'demo-user',
      email: email || 'demo@hotel.com',
      name: 'Demo Manager',
      hotelName: 'Demo Hotel'
    };

    // Generate token
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        hotelName: user.hotelName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;