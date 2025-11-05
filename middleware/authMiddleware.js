import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Error Messages - Centralized Configuration
const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Yetkiniz yok, lütfen giriş yapın.',
  INVALID_TOKEN: 'Geçersiz token, lütfen tekrar giriş yapın.',
  TOKEN_EXPIRED: 'Token süresi dolmuş, lütfen tekrar giriş yapın.',
  ADMIN_REQUIRED: 'Bu işlem için admin yetkisi gereklidir.',
  USER_NOT_FOUND: 'Kullanıcı bulunamadı.'
};

// Helper Functions - Single Responsibility
const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return null;
};

const createUnauthorizedError = (message) => ({
  success: false,
  message,
  statusCode: 401
});

const createForbiddenError = (message) => ({
  success: false,
  message,
  statusCode: 403
});

// Token Verification - Async Error Handling
const verifyToken = async (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error(ERROR_MESSAGES.TOKEN_EXPIRED);
    }
    throw new Error(ERROR_MESSAGES.INVALID_TOKEN);
  }
};

// User Retrieval - Database Query
const getUserFromToken = async (decoded) => {
  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
  }
  return user;
};

/**
 * Protect Middleware - JWT Authentication
 * Verifies Bearer token and attaches user to request
 */
const protect = async (req, res, next) => {
  try {
    // Extract token from header
    const token = extractToken(req);
    
    if (!token) {
      const error = createUnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED);
      return res.status(401).json(error);
    }

    // Verify token
    const decoded = await verifyToken(token);

    // Fetch user
    req.user = await getUserFromToken(decoded);

    // Proceed to next middleware
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    const errorResponse = createUnauthorizedError(error.message);
    res.status(401).json(errorResponse);
  }
};

/**
 * Admin Middleware - Role-Based Access Control
 * Ensures user has admin privileges
 * Must be used after protect middleware
 */
const admin = (req, res, next) => {
  if (!req.user) {
    const error = createUnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED);
    return res.status(401).json(error);
  }

  if (!req.user.isAdmin) {
    const error = createForbiddenError(ERROR_MESSAGES.ADMIN_REQUIRED);
    return res.status(403).json(error);
  }

  next();
};

/**
 * Optional Auth Middleware - Attach user if token exists
 * Doesn't fail if no token is provided
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (token) {
      const decoded = await verifyToken(token);
      req.user = await getUserFromToken(decoded);
    }
  } catch (error) {
    // Silently fail - user remains undefined
    console.warn('Optional auth failed:', error.message);
  }
  
  next();
};

export { 
  protect, 
  admin, 
  optionalAuth 
};