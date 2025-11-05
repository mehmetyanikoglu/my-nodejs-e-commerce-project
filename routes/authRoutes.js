import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Constants - Configuration
const TOKEN_EXPIRY = '30d';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

// Helper Functions - Single Responsibility Principle
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
};

const setCookieToken = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    maxAge: COOKIE_MAX_AGE,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
};

const getRedirectPath = (user) => {
  return user.isAdmin ? '/admin/dashboard' : '/workers/profile';
};

const renderLoginPage = (res, error = null, success = null) => {
  res.render('login', { error, success });
};

// Route Handlers - Clean Code Pattern
const handleLoginPageGet = (req, res) => {
  renderLoginPage(res);
};

const handleLoginPost = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return renderLoginPage(res, 'E-posta ve şifre gereklidir.');
    }

    // Find user
    const user = await User.findOne({ email }).select('+password');

    // Verify credentials
    if (!user || !(await user.matchPassword(password))) {
      return renderLoginPage(res, 'E-posta veya şifre hatalı!');
    }

    // Generate and set token
    const token = generateToken(user._id);
    setCookieToken(res, token);

    // Redirect based on role
    res.redirect(getRedirectPath(user));
  } catch (error) {
    console.error('Login error:', error);
    renderLoginPage(res, 'Sunucu hatası. Lütfen tekrar deneyin.');
  }
};

const handleLogout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/auth/login');
};

// Route Definitions - Separation of Concerns
router.get('/login', handleLoginPageGet);
router.post('/login', handleLoginPost);
router.get('/logout', handleLogout);

export default router;
