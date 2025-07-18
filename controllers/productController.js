import productModel from '../models/productModel.js';

export const createProductController = async (req, res) => {
	try {
		const {
			dealerId,
			title,
			description,
			price,
			perItem,
			shopName,
			shopAddress,
			state,
			city,
			area,
			category,
			phone,
		} = req.body;

		// Handle uploaded image
		let imagePath = null;
		if (req.file) {
			imagePath = `/uploads/${req.file.filename}`;
		}

		// Validate required fields
		if (!title || !description || !price || !shopName || !category) {
			return res.status(400).json({
				success: false,
				message:
					'Title, description, price, shop name, and category are required',
			});
		}

		// Validate dealerId if provided
		// if (dealerId && (typeof dealerId !== 'number' || dealerId <= 0)) {
		// 	return res.status(400).json({
		// 		success: false,
		// 		message: 'dealerId must be a positive number',
		// 	});
		// }

		// Validate price format
		if (typeof price !== 'string' || price.trim() === '') {
			return res.status(400).json({
				success: false,
				message: 'Price must be a valid string',
			});
		}

		// Validate phone number if provided
		// if (phone && (typeof phone !== 'number' || phone.toString().length < 10)) {
		// 	return res.status(400).json({
		// 		success: false,
		// 		message: 'Phone number must be a valid number with at least 10 digits',
		// 	});
		// }

		// Validate string fields are not empty
		const stringFields = { title, description, shopName, category };
		for (const [field, value] of Object.entries(stringFields)) {
			if (typeof value !== 'string' || value.trim() === '') {
				return res.status(400).json({
					success: false,
					message: `${
						field.charAt(0).toUpperCase() + field.slice(1)
					} must be a non-empty string`,
				});
			}
		}

		// Create product data object
		const productData = {
			dealerId,
			title: title.trim(),
			description: description.trim(),
			image: imagePath,
			price: price.trim(),
			perItem,
			shopName: shopName.trim(),
			shopAddress,
			state,
			city,
			area,
			category: category.trim(),
			phone,
		};

		// Remove undefined fields
		Object.keys(productData).forEach((key) => {
			if (productData[key] === undefined) {
				delete productData[key];
			}
		});

		const newProduct = new productModel(productData);
		await newProduct.save();

		return res.status(201).json({
			success: true,
			message: 'Product created successfully',
			product: newProduct,
		});
	} catch (error) {
		console.error('Error in createProductController:', error);

		// Handle duplicate key error
		if (error.code === 11000) {
			return res.status(409).json({
				success: false,
				message: 'Product with this ID already exists',
			});
		}

		// Handle validation errors
		if (error.name === 'ValidationError') {
			return res.status(400).json({
				success: false,
				message: 'Validation error',
				error: error.message,
			});
		}

		// Handle multer errors
		if (error.code === 'LIMIT_FILE_SIZE') {
			return res.status(400).json({
				success: false,
				message: 'File size too large. Maximum allowed size is 5MB',
			});
		}

		if (error.message === 'Only image files are allowed!') {
			return res.status(400).json({
				success: false,
				message: 'Only image files are allowed',
			});
		}

		return res.status(500).json({
			success: false,
			message: 'Internal server error',
			error: error.message,
		});
	}
};
export const getAllProductsController = async (req, res) => {
	try {
		const products = await productModel.find({});
		return res.status(200).json({
			success: true,
			message: 'Products retrieved successfully',
			products,
		});
	} catch (error) {
		console.error('Error in getAllProductsController:', error);
		return res.status(500).json({
			success: false,
			message: 'Internal server error',
			error: error.message,
		});
	}
};
export const getProductByIdController = async (req, res) => {
	try {
		const { id } = req.params;
		if (!id) {
			return res.status(400).json({
				success: false,
				message: 'Product ID is required',
			});
		}

		// Convert id to number since the custom id field is a Number type
		const numericId = parseInt(id);
		if (isNaN(numericId)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid product ID format',
			});
		}

		// Find product by custom id field
		const product = await productModel.find({ dealerId: numericId });

		if (!product) {
			return res.status(404).json({
				success: false,
				message: 'Product not found',
			});
		}

		return res.status(200).json({
			success: true,
			message: 'Product retrieved successfully',
			product: product,
		});
	} catch (error) {
		console.error('Error in getProductByIdController:', error);
		return res.status(500).json({
			success: false,
			message: 'Internal server error',
			error: error.message,
		});
	}
};

export const deleteProductController = async (req, res) => {
	try {
		const { id } = req.params;

		if (!id) {
			return res.status(400).json({
				success: false,
				message: 'Product ID is required',
			});
		}

		// Convert id to number since the custom id field is a Number type
		const numericId = parseInt(id);
		if (isNaN(numericId)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid product ID format',
			});
		}

		// Use findOneAndDelete with the custom id field instead of _id
		const deletedProduct = await productModel.findOneAndDelete({
			id: numericId,
		});

		if (!deletedProduct) {
			return res.status(404).json({
				success: false,
				message: 'Product not found',
			});
		}

		return res.status(200).json({
			success: true,
			message: 'Product deleted successfully',
			product: deletedProduct,
		});
	} catch (error) {
		console.error('Error in deleteProductController:', error);
		return res.status(500).json({
			success: false,
			message: 'Internal server error',
			error: error.message,
		});
	}
};
export const updateProductController = async (req, res) => {
	try {
		const { id } = req.params;
		const {
			dealerId,
			title,
			description,
			price,
			perItem,
			shopName,
			shopAddress,
			state,
			city,
			area,
			category,
			phone,
		} = req.body;

		// Handle uploaded image
		let imagePath = null;
		if (req.file) {
			imagePath = `/uploads/${req.file.filename}`;
		}

		// Check if product ID is provided
		if (!id) {
			return res.status(400).json({
				success: false,
				message: 'Product ID is required',
			});
		}

		// Convert id to number since the custom id field is a Number type
		const numericId = parseInt(id);
		if (isNaN(numericId)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid product ID format',
			});
		}

		// Check if product exists using the custom id field
		const existingProduct = await productModel.findOne({ id: numericId });
		if (!existingProduct) {
			return res.status(404).json({
				success: false,
				message: 'Product not found',
			});
		}

		// Validate dealerId if provided
		if (
			dealerId !== undefined &&
			(typeof dealerId !== 'number' || dealerId <= 0)
		) {
			return res.status(400).json({
				success: false,
				message: 'dealerId must be a positive number',
			});
		}

		// Validate price format if provided
		if (
			price !== undefined &&
			(typeof price !== 'string' || price.trim() === '')
		) {
			return res.status(400).json({
				success: false,
				message: 'Price must be a valid string',
			});
		}

		// Validate phone number if provided
		if (
			phone !== undefined &&
			(typeof phone !== 'number' || phone.toString().length < 10)
		) {
			return res.status(400).json({
				success: false,
				message: 'Phone number must be a valid number with at least 10 digits',
			});
		}

		// Validate string fields if provided
		const stringFields = { title, description, shopName, category };
		for (const [field, value] of Object.entries(stringFields)) {
			if (
				value !== undefined &&
				(typeof value !== 'string' || value.trim() === '')
			) {
				return res.status(400).json({
					success: false,
					message: `${
						field.charAt(0).toUpperCase() + field.slice(1)
					} must be a non-empty string`,
				});
			}
		}

		// Create update data object with only provided fields
		const updateData = {};

		if (dealerId !== undefined) updateData.dealerId = dealerId;
		if (title !== undefined) updateData.title = title.trim();
		if (description !== undefined) updateData.description = description.trim();
		if (imagePath !== null) updateData.image = imagePath;
		if (price !== undefined) updateData.price = price.trim();
		if (perItem !== undefined) updateData.perItem = perItem;
		if (shopName !== undefined) updateData.shopName = shopName.trim();
		if (shopAddress !== undefined) updateData.shopAddress = shopAddress;
		if (state !== undefined) updateData.state = state;
		if (city !== undefined) updateData.city = city;
		if (area !== undefined) updateData.area = area;
		if (category !== undefined) updateData.category = category.trim();
		if (phone !== undefined) updateData.phone = phone;

		// Check if there are fields to update
		if (Object.keys(updateData).length === 0) {
			return res.status(400).json({
				success: false,
				message: 'At least one field is required to update',
			});
		}

		const updatedProduct = await productModel.findOneAndUpdate(
			{ id: numericId },
			updateData,
			{ new: true, runValidators: true }
		);

		return res.status(200).json({
			success: true,
			message: 'Product updated successfully',
			product: updatedProduct,
		});
	} catch (error) {
		console.error('Error in updateProductController:', error);

		// Handle validation errors
		if (error.name === 'ValidationError') {
			return res.status(400).json({
				success: false,
				message: 'Validation error',
				error: error.message,
			});
		}

		// Handle cast error (invalid ObjectId)
		if (error.name === 'CastError') {
			return res.status(400).json({
				success: false,
				message: 'Invalid product ID format',
			});
		}

		// Handle multer errors
		if (error.code === 'LIMIT_FILE_SIZE') {
			return res.status(400).json({
				success: false,
				message: 'File size too large. Maximum allowed size is 5MB',
			});
		}

		if (error.message === 'Only image files are allowed!') {
			return res.status(400).json({
				success: false,
				message: 'Only image files are allowed',
			});
		}

		return res.status(500).json({
			success: false,
			message: 'Internal server error',
			error: error.message,
		});
	}
};
