// backend/controllers/authController.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';

/**
 * Generate a signed JWT token valid for 1 day
 * @param {string} id - The MongoDB user document identifier
 * @param {string} role - The user role
 */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '1d', // Token valid for 1 day
  });
};

/**
 * @desc    Register a new user account
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create the new User. Pre-save hooks handle password hashing.
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'customer',
    });

    if (user) {
      // Create audit log for registration
      await AuditLog.create({
        userId: user._id,
        action: 'REGISTER',
        meta: { email: user.email, role: user.role }
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      });
    } else {
      res.status(400).json({ message: 'Invalid user registration input' });
    }
  } catch (error) {
    console.error(`Register Error: ${error.message}`);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

/**
 * @desc    Authenticate user & return JWT token with audit logs
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Create Audit Log for successful login
      await AuditLog.create({
        userId: user._id,
        action: 'LOGIN',
        meta: { ip: req.ip, userAgent: req.headers['user-agent'] }
      });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(`Login Error: ${error.message}`);
    res.status(500).json({ message: 'Server error during login authentication.' });
  }
};

/**
 * @desc    Get the currently logged-in user profile details
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    if (req.user) {
      res.json(req.user);
    } else {
      res.status(404).json({ message: 'User profile not found' });
    }
  } catch (error) {
    console.error(`Get Profile Error: ${error.message}`);
    res.status(500).json({ message: 'Server error retrieving profile information.' });
  }
};
