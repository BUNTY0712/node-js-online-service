/**
 * Simple migration script to update existing product images from relative paths to full URLs
 */

import productModel from '../models/productModel.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function migrateImageUrls() {
	try {
		console.log('🚀 Starting image URL migration...');

		// Connect to database
		await mongoose.connect(process.env.DB_URI);
		console.log('✅ Connected to database');

		const baseUrl =
			process.env.API_URL || 'https://node-js-online-service.onrender.com';
		console.log(`🔗 Using base URL: ${baseUrl}`);

		// Find products with relative paths
		const products = await productModel.find({
			image: { $regex: '^/uploads/', $options: 'i' },
		});

		console.log(`📊 Found ${products.length} products to update`);

		if (products.length === 0) {
			console.log('✅ No migration needed');
			await mongoose.connection.close();
			return;
		}

		// Update each product
		let updated = 0;
		for (const product of products) {
			const newImageUrl = `${baseUrl}${product.image}`;
			await productModel.findByIdAndUpdate(product._id, { image: newImageUrl });
			console.log(`✅ Updated: ${product.title}`);
			updated++;
		}

		console.log(`🎉 Migration completed! Updated ${updated} products`);
	} catch (error) {
		console.error('❌ Migration failed:', error.message);
	} finally {
		await mongoose.connection.close();
		console.log('🔚 Database connection closed');
	}
}

migrateImageUrls();
