const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

// How many "rounds" bcrypt uses to hash the password. Higher = slower to
const SALT_ROUNDS = 10;

// How long a token stays valid before the user has to log in again.
const TOKEN_EXPIRY = '24h';

// POST /api/auth/register
async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'password must be at least 8 characters' });
    }

    const existingUser = await userModel.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await userModel.createUser(name, email, passwordHash);

    res.status(201).json({
      message: 'Account created successfully',
      user: newUser
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while creating the account' });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await userModel.getUserByEmail(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // bcrypt.compare() hashes the password the user just typed and checks
    // if it matches the stored hash - we never decrypt the stored hash.
    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // The token is like a signed ID card: it contains the user's id,
    // and is signed with our JWT_SECRET so we can verify later that
    // it wasn't tampered with. Anyone can read what's inside a token
    // (it's not encrypted), so never put sensitive data in here.
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while logging in' });
  }
}

module.exports = {
  register,
  login
};