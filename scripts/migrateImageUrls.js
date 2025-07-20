/**
 * Migration script to update existing product images from relative paths to full URLs
 * Run this once after deploying the updated code to fix existing data
 */

import productModel from '../models/productModel.js';
import connectDB from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const migrateImageUrls = async () => {
	try {
		// Connect to database
		await connectDB();
		console.log('Connected to database for migration');

		// Get your API URL from environment
		const baseUrl =
			process.env.API_URL || 'https://node-js-online-service.onrender.com';

		// Find all products with relative image paths
		const products = await productModel.find({
			image: { $regex: '^/uploads/', $options: 'i' },
		});

		console.log(`Found ${products.length} products with relative image paths`);

		if (products.length === 0) {
			console.log('No products need migration');
			return;
		}

		// Update each product
		let updateCount = 0;
		for (const product of products) {
			if (product.image && product.image.startsWith('/uploads/')) {
				const fullUrl = `${baseUrl}${product.image}`;
				await productModel.findByIdAndUpdate(product._id, { image: fullUrl });
				updateCount++;
				console.log(
					`Updated product ${product._id}: ${product.image} -> ${fullUrl}`
				);
			}
		}

		console.log(`✅ Migration completed! Updated ${updateCount} products`);
	} catch (error) {
		console.error('❌ Migration failed:', error);
	} finally {
		process.exit(0);
	}
};

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	migrateImageUrls();
}

export default migrateImageUrls;
