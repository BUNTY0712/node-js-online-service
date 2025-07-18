import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

const authenticateToken = async (req, res, next) => {
	try {
		// Get token from header
		const authHeader = req.headers['authorization'];
		const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

		if (!token) {
			return res.status(401).json({
				success: false,
				message: 'Access token is required',
			});
		}

		// Verify token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		// Get user from database
		const user = await userModel
			.findById(decoded.userId)
			.select('-password -confirm_password');

		if (!user) {
			return res.status(401).json({
				success: false,
				message: 'Invalid token - user not found',
			});
		}

		// Add user and token data to request object
		req.user = user;
		req.tokenData = {
			userId: decoded.userId,
			email: decoded.email,
			user_type: decoded.user_type,
			dashboardAccess: decoded.dashboardAccess,
		};
		next();
	} catch (error) {
		if (error.name === 'JsonWebTokenError') {
			return res.status(401).json({
				success: false,
				message: 'Invalid token',
			});
		} else if (error.name === 'TokenExpiredError') {
			return res.status(401).json({
				success: false,
				message: 'Token expired',
			});
		}
		console.log('Error in authenticateToken middleware:', error);
		return res.status(500).json({
			success: false,
			message: 'Internal server error',
			error: error.message,
		});
	}
};

// Role-based access control middleware
const requireDashboardAccess = (requiredDashboard) => {
	return (req, res, next) => {
		try {
			const { tokenData } = req;

			if (!tokenData || !tokenData.dashboardAccess) {
				return res.status(403).json({
					success: false,
					message: 'Access denied - no dashboard permissions',
				});
			}

			if (!tokenData.dashboardAccess.includes(requiredDashboard)) {
				return res.status(403).json({
					success: false,
					message: `Access denied - ${requiredDashboard} dashboard access required`,
				});
			}

			next();
		} catch (error) {
			console.log('Error in requireDashboardAccess middleware:', error);
			return res.status(500).json({
				success: false,
				message: 'Internal server error',
				error: error.message,
			});
		}
	};
};

export { authenticateToken, requireDashboardAccess };
