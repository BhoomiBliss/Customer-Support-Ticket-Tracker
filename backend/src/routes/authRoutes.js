// backend/routes/authRoutes.js
import express from 'express';
import { registerUser, loginUser, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public endpoint: creates user profiles
router.post('/register', registerUser);

// Public endpoint: verifies logins and returns JWT
router.post('/login', loginUser);

// Private endpoint: fetches profile configurations
router.get('/me', protect, getMe);

export default router;
