import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import mongoose from 'mongoose';
import shopModel from '../models/shopModel.js'; // Add this import
import crypto from 'crypto';
import transporter from '../utils/emailTransporter.js';

export const loginController = async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			return res.status(400).json({
				success: false,
				message: 'Email and password are required',
			});
		}

		// Find user by email only
		const user = await userModel.findOne({ email });
		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(401).json({
				success: false,
				message: 'Invalid credentials',
			});
		}

		// Find shop for this user and get shop_address
		const shop = await shopModel.findOne({ user_id: user._id });
		const shopAddress = shop ? shop : null;

		// Remove password from response
		const userResponse = user.toObject();
		delete userResponse.password;
		delete userResponse.confirm_password;

		// Determine dashboard access based on user's stored user_type
		let dashboardAccess = [];
		switch (user.user_type) {
			case 'dealer':
				dashboardAccess = ['customer', 'dealer'];
				break;
			case 'customer':
				dashboardAccess = ['customer'];
				break;
			case 'admin':
				dashboardAccess = ['dealer', 'customer', 'admin'];
				break;
			default:
				dashboardAccess = ['customer']; // Default to customer access
		}

		// Generate JWT token
		const token = jwt.sign(
			{
				userId: user._id,
				email: user.email,
				user_type: user.user_type,
				dashboardAccess: dashboardAccess,
			},
			process.env.JWT_SECRET,
			{
				expiresIn: '7d', // Token expires in 7 days
			}
		);

		return res.status(200).json({
			success: true,
			message: 'Login successful',
			token: token,
			user: userResponse,
			dashboardAccess: dashboardAccess,
			shopAddress: shopAddress, // Add shop address to response
		});
	} catch (error) {
		console.log('Error in loginController:', error);
		return res.status(500).json({
			success: false,
			message: 'Internal server error',
			error: error.message,
		});
	}
};

export const registerController = async (req, res) => {
	try {
		const {
			fullname,
			phone,
			email,
			city,
			user_type,
			password,
			confirm_password,
		} = req.body;

		// Validate required fields
		if (!fullname || !email || !password || !confirm_password || !user_type) {
			return res.status(400).json({
				success: false,
				message:
					'Full name, email, password, confirm password, and user type are required',
			});
		}

		// Validate user_type
		const validUserTypes = ['dealer', 'customer', 'admin'];
		if (!validUserTypes.includes(user_type)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid user type. Must be dealer, customer, or admin',
			});
		}

		// Check if passwords match
		if (password !== confirm_password) {
			return res.status(400).json({
				success: false,
				message: 'Passwords do not match',
			});
		}

		// Check if user already exists with same email and user_type
		const existingUser = await userModel.findOne({ email, user_type });
		if (existingUser) {
			return res.status(409).json({
				success: false,
				message: `User with this email already exists as ${user_type}`,
			});
		}

		// Hash the password
		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(password, saltRounds);

		// Set trial_end to 1 month from now and is_subscribed to false
		const trialEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
		const newUser = new userModel({
			fullname,
			phone,
			email,
			city,
			user_type,
			password: hashedPassword,
			confirm_password: hashedPassword, // Store hashed version
			trial_end: trialEndDate,
			is_subscribed: false,
		});

		await newUser.save();

		// Remove password from response
		const userResponse = newUser.toObject();
		delete userResponse.password;
		delete userResponse.confirm_password;

		// Determine dashboard access based on user type
		let dashboardAccess = [];
		switch (user_type) {
			case 'dealer':
				dashboardAccess = ['user', 'dealer'];
				break;
			case 'customer':
				dashboardAccess = ['customer'];
				break;
			case 'admin':
				dashboardAccess = ['user', 'dealer', 'customer', 'admin'];
				break;
			default:
				dashboardAccess = ['customer']; // Default to customer access
		}

		// Generate JWT token for immediate login after registration
		const token = jwt.sign(
			{
				userId: newUser._id,
				email: newUser.email,
				user_type: newUser.user_type,
				dashboardAccess: dashboardAccess,
			},
			process.env.JWT_SECRET,
			{
				expiresIn: '7d', // Token expires in 7 days
			}
		);

		return res.status(201).json({
			success: true,
			message: 'User registered successfully',
			token: token,
			user: userResponse,
			dashboardAccess: dashboardAccess,
		});
	} catch (error) {
		console.log('Error in registerController:', error);
		return res.status(500).json({
			success: false,
			message: 'Internal server error',
			error: error.message,
		});
	}
};

export const updateUserProfile = async (req, res) => {
	try {
		const { id, ...updates } = req.body;

		// Remove _id and id from updates to avoid ObjectId cast errors
		delete updates._id;
		delete updates.id;

		if (!id) {
			return res.status(400).json({
				success: false,
				message: 'User id is required in request body',
			});
		}

		const updatedUser = await userModel.findOneAndUpdate({ id: id }, updates, {
			new: true,
		});

		if (!updatedUser) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}

		const userResponse = updatedUser.toObject();
		delete userResponse.password;
		delete userResponse.confirm_password;

		return res.status(200).json({
			success: true,
			message: 'User profile updated successfully',
			user: userResponse,
		});
	} catch (error) {
		console.log('Error in updateUserProfile:', error);
		return res.status(500).json({
			success: false,
			message: 'Internal server error',
			error: error.message,
		});
	}
};

export const getUserProfile = async (req, res) => {
	try {
		// User is already available from auth middleware
		const user = req.user;
		const { tokenData } = req;

		return res.status(200).json({
			success: true,
			message: 'User profile retrieved successfully',
			user: user,
			dashboardAccess: tokenData?.dashboardAccess || [],
		});
	} catch (error) {
		console.log('Error in getUserProfile:', error);
		return res.status(500).json({
			success: false,
			message: 'Internal server error',
			error: error.message,
		});
	}
};

export const logoutController = async (req, res) => {
	try {
		// Since JWT tokens are stateless, we can't "invalidate" them on the server side
		// without maintaining a blacklist (which would require additional storage)
		// The logout is handled on the client side by removing the token

		return res.status(200).json({
			success: true,
			message:
				'Logout successful. Please remove the token from client storage.',
		});
	} catch (error) {
		console.log('Error in logoutController:', error);
		return res.status(500).json({
			success: false,
			message: 'Internal server error',
			error: error.message,
		});
	}
};

export const checkDashboardAccess = async (req, res) => {
	try {
		const { dashboard } = req.params;
		const { tokenData } = req;

		if (!tokenData || !tokenData.dashboardAccess) {
			return res.status(403).json({
				success: false,
				message: 'Access denied - no dashboard permissions',
				hasAccess: false,
			});
		}

		const hasAccess = tokenData.dashboardAccess.includes(dashboard);

		return res.status(200).json({
			success: true,
			message: `Dashboard access check for ${dashboard}`,
			hasAccess: hasAccess,
			userType: tokenData.user_type,
			allDashboardAccess: tokenData.dashboardAccess,
		});
	} catch (error) {
		console.log('Error in checkDashboardAccess:', error);
		return res.status(500).json({
			success: false,
			message: 'Internal server error',
			error: error.message,
		});
	}
};

export const getUserByIdController = async (req, res) => {
	try {
		const { id } = req.params;

		if (!id) {
			return res.status(400).json({
				success: false,
				message: 'User id is required',
			});
		}

		let user = null;
		// Try to find by ObjectId if valid
		if (mongoose.Types.ObjectId.isValid(id)) {
			user = await userModel.findById(id);
		}
		// If not found, try to find by numeric id field
		if (!user && !isNaN(Number(id))) {
			user = await userModel.findOne({ id: Number(id) });
		}

		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}

		const userResponse = user.toObject();
		delete userResponse.password;
		delete userResponse.confirm_password;

		// Build dashboardAccess based on user_type
		let dashboardAccess = [];
		switch (user.user_type) {
			case 'dealer':
				dashboardAccess = ['customer', 'dealer'];
				break;
			case 'customer':
				dashboardAccess = ['customer'];
				break;
			case 'admin':
				dashboardAccess = ['dealer', 'customer', 'admin'];
				break;
			default:
				dashboardAccess = ['customer'];
		}

		return res.status(200).json({
			success: true,
			message: 'User profile retrieved successfully',
			user: userResponse,
			dashboardAccess: dashboardAccess,
		});
	} catch (error) {
		console.log('Error in getUserByIdController:', error);
		return res.status(500).json({
			success: false,
			message: 'Internal server error',
			error: error.message,
		});
	}
};

// 1. Request password reset (send email with token)
export const requestPasswordReset = async (req, res) => {
	try {
		const { email } = req.body;
		if (!email) {
			return res
				.status(400)
				.json({ success: false, message: 'Email is required' });
		}
		const user = await userModel.findOne({ email });
		if (!user) {
			return res
				.status(404)
				.json({ success: false, message: 'User not found' });
		}
		// Generate token
		const resetToken = crypto.randomBytes(32).toString('hex');
		const resetTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
		user.resetPasswordToken = resetToken;
		user.resetPasswordExpires = resetTokenExpiry;
		await user.save();

		// Send email
		const resetUrl = `${
			process.env.FRONTEND_URL || 'http://localhost:3000'
		}/reset-password/${resetToken}`;
		const mailOptions = {
			from: process.env.EMAIL_USER,
			to: user.email,
			subject: 'Password Reset Request',
			html: `<p>You requested a password reset.</p><p>Click <a href="${resetUrl}">here</a> to reset your password. This link is valid for 1 hour.</p>`,
		};
		await transporter.sendMail(mailOptions);

		return res
			.status(200)
			.json({ success: true, message: 'Password reset email sent' });
	} catch (error) {
		console.log('Error in requestPasswordReset:', error);
		return res.status(500).json({
			success: false,
			message: 'Internal server error',
			error: error.message,
		});
	}
};

// 2. Reset password (with token)
export const resetPassword = async (req, res) => {
	try {
		const { token } = req.params;
		const { password, confirm_password } = req.body;
		if (!password || !confirm_password) {
			return res.status(400).json({
				success: false,
				message: 'Password and confirm password are required',
			});
		}
		if (password !== confirm_password) {
			return res
				.status(400)
				.json({ success: false, message: 'Passwords do not match' });
		}
		const user = await userModel.findOne({
			resetPasswordToken: token,
			resetPasswordExpires: { $gt: Date.now() },
		});
		if (!user) {
			return res
				.status(400)
				.json({ success: false, message: 'Invalid or expired token' });
		}
		// Hash new password
		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(password, saltRounds);
		user.password = hashedPassword;
		user.confirm_password = hashedPassword;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpires = undefined;
		await user.save();
		return res
			.status(200)
			.json({ success: true, message: 'Password reset successful' });
	} catch (error) {
		console.log('Error in resetPassword:', error);
		return res.status(500).json({
			success: false,
			message: 'Internal server error',
			error: error.message,
		});
	}
};
