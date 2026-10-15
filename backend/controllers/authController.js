const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  createdAt: u.createdAt,
});

const emailRegex = /^\S+@\S+\.\S+$/;

// POST /api/auth/register
exports.register = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }
  if (String(name).trim().length < 2) {
    return res.status(400).json({ message: 'Name must be at least 2 characters' });
  }
  if (!emailRegex.test(String(email).trim())) {
    return res.status(400).json({ message: 'Please enter a valid email' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  if (confirmPassword !== undefined && password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return res.status(400).json({ message: 'An account with this email already exists' });
  }

  const hashed = await bcrypt.hash(String(password), 10);
  // role is never taken from the request body: everyone registers as a normal user
  const user = await User.create({ name: String(name).trim(), email: normalizedEmail, password: hashed, role: 'user' });

  res.status(201).json({ token: signToken(user._id), user: publicUser(user) });
};

// POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  const user = await User.findOne({ email: String(email).trim().toLowerCase() });
  if (!user || !(await bcrypt.compare(String(password), user.password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  res.json({ token: signToken(user._id), user: publicUser(user) });
};

// GET /api/auth/profile
exports.getProfile = async (req, res) => {
  res.json(publicUser(req.user));
};

// PUT /api/auth/profile  (name, and optionally a new password)
exports.updateProfile = async (req, res) => {
  const { name, currentPassword, newPassword } = req.body || {};
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (name !== undefined) {
    if (String(name).trim().length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters' });
    }
    user.name = String(name).trim();
  }

  if (newPassword) {
    if (!currentPassword || !(await bcrypt.compare(String(currentPassword), user.password))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    user.password = await bcrypt.hash(String(newPassword), 10);
  }

  await user.save();
  res.json(publicUser(user));
};

// GET /api/auth/users  (admin only)
exports.getUsers = async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json(users.map(publicUser));
};
