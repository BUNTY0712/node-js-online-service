import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

export const loginController = async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			return res.status(400).json({
				success: false,
				message: 'Email and password are required',
			});
		}
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

		// Remove password from response
		const userResponse = user.toObject();
		delete userResponse.password;
		delete userResponse.confirm_password;

		// Generate JWT token
		const token = jwt.sign(
			{
				userId: user._id,
				email: user.email,
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
		if (!fullname || !email || !password || !confirm_password) {
			return res.status(400).json({
				success: false,
				message:
					'Full name, email, password, and confirm password are required',
			});
		}

		// Check if passwords match
		if (password !== confirm_password) {
			return res.status(400).json({
				success: false,
				message: 'Passwords do not match',
			});
		}

		// Check if user already exists
		const existingUser = await userModel.findOne({ email });
		if (existingUser) {
			return res.status(409).json({
				success: false,
				message: 'User with this email already exists',
			});
		}

		// Hash the password
		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(password, saltRounds);

		// Create new user
		const newUser = new userModel({
			fullname,
			phone,
			email,
			city,
			user_type,
			password: hashedPassword,
			confirm_password: hashedPassword, // Store hashed version
		});

		await newUser.save();

		// Remove password from response
		const userResponse = newUser.toObject();
		delete userResponse.password;
		delete userResponse.confirm_password;

		// Generate JWT token for immediate login after registration
		const token = jwt.sign(
			{
				userId: newUser._id,
				email: newUser.email,
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

export const getUserProfile = async (req, res) => {
	try {
		// User is already available from auth middleware
		const user = req.user;

		return res.status(200).json({
			success: true,
			message: 'User profile retrieved successfully',
			user: user,
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
