import express from 'express';

import {
	registerController,
	loginController,
	getUserProfile,
} from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/login-user', loginController);
router.post('/register', registerController);

// Protected route - requires JWT token
router.get('/profile', authenticateToken, getUserProfile);

export default router;
