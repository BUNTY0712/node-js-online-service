import productModel from '../models/productModel.js';
import { generateImageUrl, convertToFullUrl } from '../utils/urlUtils.js';

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
			// Use utility function to generate full URL
			imagePath = generateImageUrl(req, req.file.filename);
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

		// Convert any relative image paths to full URLs for backward compatibility
		const productsWithFullUrls = products.map((product) => {
			const productObj = product.toObject();
			if (productObj.image) {
				productObj.image = convertToFullUrl(req, productObj.image);
			}
			return productObj;
		});

		return res.status(200).json({
			success: true,
			message: 'Products retrieved successfully',
			products: productsWithFullUrls,
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
		const products = await productModel.find({ dealerId: numericId });

		if (!products || products.length === 0) {
			return res.status(404).json({
				success: false,
				message: 'Product not found',
			});
		}

		// Convert any relative image paths to full URLs for backward compatibility
		const productsWithFullUrls = products.map((product) => {
			const productObj = product.toObject();
			if (productObj.image) {
				productObj.image = convertToFullUrl(req, productObj.image);
			}
			return productObj;
		});

		return res.status(200).json({
			success: true,
			message: 'Product retrieved successfully',
			product: productsWithFullUrls,
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
			// Use utility function to generate full URL
			imagePath = generateImageUrl(req, req.file.filename);
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
		// if (
		// 	dealerId !== undefined &&
		// 	(typeof dealerId !== 'number' || dealerId <= 0)
		// ) {
		// 	return res.status(400).json({
		// 		success: false,
		// 		message: 'dealerId must be a positive number',
		// 	});
		// }

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
		// if (
		// 	phone !== undefined &&
		// 	(typeof phone !== 'number' || phone.toString().length < 10)
		// ) {
		// 	return res.status(400).json({
		// 		success: false,
		// 		message: 'Phone number must be a valid number with at least 10 digits',
		// 	});
		// }

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
export const searchProductsByTitleController = async (req, res) => {
	try {
		const { title } = req.query;

		// Check if search term is provided
		if (!title) {
			return res.status(400).json({
				success: false,
				message: 'Search title is required',
			});
		}

		// Validate search term
		if (typeof title !== 'string' || title.trim() === '') {
			return res.status(400).json({
				success: false,
				message: 'Search title must be a non-empty string',
			});
		}

		// Search for products using case-insensitive regex
		const products = await productModel.find({
			title: { $regex: title.trim(), $options: 'i' },
		});

		// Increment search count for found products
		if (products.length > 0) {
			await productModel.updateMany(
				{ _id: { $in: products.map((p) => p._id) } },
				{ $inc: { searchCount: 1 } }
			);
		}

		// Convert any relative image paths to full URLs for backward compatibility
		const productsWithFullUrls = products.map((product) => {
			const productObj = product.toObject();
			if (productObj.image) {
				productObj.image = convertToFullUrl(req, productObj.image);
			}
			return productObj;
		});

		return res.status(200).json({
			success: true,
			message: `Found ${products.length} product(s) matching "${title}"`,
			count: products.length,
			products: productsWithFullUrls,
		});
	} catch (error) {
		console.error('Error in searchProductsByTitleController:', error);
		return res.status(500).json({
			success: false,
			message: 'Internal server error',
			error: error.message,
		});
	}
};
export const filterProductsByStateCityAreaController = async (req, res) => {
	try {
		const { state, city, area } = req.query;

		// Check if at least one filter parameter is provided
		if (!state && !city && !area) {
			return res.status(400).json({
				success: false,
				message:
					'At least one filter parameter (state, city, or area) is required',
			});
		}

		// Build filter object dynamically
		const filter = {};

		// Add filters based on provided parameters (case-insensitive)
		if (state) {
			if (typeof state !== 'string' || state.trim() === '') {
				return res.status(400).json({
					success: false,
					message: 'State must be a non-empty string',
				});
			}
			filter.state = { $regex: state.trim(), $options: 'i' };
		}

		if (city) {
			if (typeof city !== 'string' || city.trim() === '') {
				return res.status(400).json({
					success: false,
					message: 'City must be a non-empty string',
				});
			}
			filter.city = { $regex: city.trim(), $options: 'i' };
		}

		if (area) {
			if (typeof area !== 'string' || area.trim() === '') {
				return res.status(400).json({
					success: false,
					message: 'Area must be a non-empty string',
				});
			}
			filter.area = { $regex: area.trim(), $options: 'i' };
		}

		// Find products matching the filter criteria
		const products = await productModel.find(filter);

		// Convert any relative image paths to full URLs for backward compatibility
		const productsWithFullUrls = products.map((product) => {
			const productObj = product.toObject();
			if (productObj.image) {
				productObj.image = convertToFullUrl(req, productObj.image);
			}
			return productObj;
		});

		// Build descriptive message
		const filterParts = [];
		if (state) filterParts.push(`state: "${state}"`);
		if (city) filterParts.push(`city: "${city}"`);
		if (area) filterParts.push(`area: "${area}"`);
		const filterDescription = filterParts.join(', ');

		return res.status(200).json({
			success: true,
			message: `Found ${products.length} product(s) matching filters (${filterDescription})`,
			count: products.length,
			filters: { state, city, area },
			products: productsWithFullUrls,
		});
	} catch (error) {
		console.error('Error in filterProductsByStateCityAreaController:', error);
		return res.status(500).json({
			success: false,
			message: 'Internal server error',
			error: error.message,
		});
	}
};
export const getMostSearchedSixProductsController = async (req, res) => {
	try {
		// Get the 6 most searched products based on searchCount field
		const products = await productModel
			.find({})
			.sort({ searchCount: -1, created_at: -1 }) // Sort by search count first, then by creation date
			.limit(6)
			.select('-__v'); // Exclude version field

		// Convert any relative image paths to full URLs for backward compatibility
		const productsWithFullUrls = products.map((product) => {
			const productObj = product.toObject();
			if (productObj.image) {
				productObj.image = convertToFullUrl(req, productObj.image);
			}
			return productObj;
		});

		return res.status(200).json({
			success: true,
			message: 'Most searched products retrieved successfully',
			count: products.length,
			products: productsWithFullUrls,
		});
	} catch (error) {
		console.error('Error in getMostSearchedSixProductsController:', error);
		return res.status(500).json({
			success: false,
			message: 'Internal server error',
			error: error.message,
		});
	}
};
