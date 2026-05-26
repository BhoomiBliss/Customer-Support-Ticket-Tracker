// backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // local imports must include .js in Node ES Modules

/**
 * Protect middleware: validates JWT from request headers
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Save user payload parameters to request object, excluding password hash
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found in system, auth denied' });
      }

      return next();
    } catch (error) {
      console.error(`JWT Verification Error: ${error.message}`);
      return res.status(401).json({ message: 'Token is invalid or has expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Authorization denied: token not provided' });
  }
};

/**
 * Agent-only access control
 */
export const agentOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'agent' || req.user.role === 'admin')) {
    return next();
  }
  return res.status(403).json({ message: 'Access denied: support agent/admin privileges required' });
};

/**
 * Admin-only access control
 */
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied: administrator privileges required' });
};
