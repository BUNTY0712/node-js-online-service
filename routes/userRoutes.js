import express from 'express';

import {
	registerController,
	loginController,
	getUserProfile,
	logoutController,
	checkDashboardAccess,
	updateUserProfile,
	getUserByIdController,
	requestPasswordReset,
	resetPassword,
} from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
const router = express.Router();

// Password reset routes
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password/:token', resetPassword);

router.post('/login-user', loginController);
router.post('/register', registerController);

// Protected routes - require JWT token
router.get('/profile', authenticateToken, getUserProfile);
router.post('/logout', authenticateToken, logoutController);
router.post('/update-profile', authenticateToken, updateUserProfile);
router.get('/get-user-by-id/:id', authenticateToken, getUserByIdController);
router.get(
	'/check-dashboard-access/:dashboard',
	authenticateToken,
	checkDashboardAccess
);

export default router;
