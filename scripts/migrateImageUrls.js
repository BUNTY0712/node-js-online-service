/**
 * Migration script to update existing product images from relative paths to full URLs
 * Run this once after deploying the updated code to fix existing data
 */

import productModel from '../models/productModel.js';
import connectDB from '../config/db.js';
import dotenv from 'dotenv';
import colors from 'colors';
import mongoose from 'mongoose';

dotenv.config();

const migrateImageUrls = async () => {
	try {
		console.log('🚀 Starting image URL migration...'.blue);

		// Connect to database
		await connectDB();
		console.log('✅ Connected to database for migration'.green);

		// Get your API URL from environment
		const baseUrl =
			process.env.API_URL || 'https://node-js-online-service.onrender.com';
		console.log(`🔗 Using base URL: ${baseUrl}`.yellow);

		// First, let's see all products and their image fields
		const allProducts = await productModel.find({}).select('_id title image');
		console.log(`📊 Total products in database: ${allProducts.length}`.yellow);

		if (allProducts.length === 0) {
			console.log('⚠️  No products found in database'.yellow);
			return;
		}

		// Show some examples of current image URLs
		console.log('\n📸 Current image URL examples:'.blue);
		allProducts.slice(0, 5).forEach((product, index) => {
			console.log(
				`${index + 1}. ${product.title}: ${product.image || 'No image'}`
			);
		});

		// Find all products with relative image paths
		const productsWithRelativePaths = await productModel.find({
			image: { $regex: '^/uploads/', $options: 'i' },
		});

		console.log(
			`\n🔍 Found ${productsWithRelativePaths.length} products with relative image paths`
				.yellow
		);

		if (productsWithRelativePaths.length === 0) {
			console.log(
				'✅ No products need migration - all images already have full URLs'
					.green
			);
			return;
		}

		console.log('\n🔄 Products to be updated:'.blue);
		productsWithRelativePaths.forEach((product, index) => {
			console.log(`${index + 1}. ${product.title}: ${product.image}`);
		});

		// Ask for confirmation in development
		if (process.env.NODE_ENV !== 'production') {
			console.log(
				'\n⚠️  This will update the database. Press Ctrl+C to cancel, or wait 5 seconds to continue...'
					.yellow
			);
			await new Promise((resolve) => setTimeout(resolve, 5000));
		}

		// Update each product
		let updateCount = 0;
		console.log('\n🔧 Starting updates...'.blue);

		for (const product of productsWithRelativePaths) {
			if (product.image && product.image.startsWith('/uploads/')) {
				const fullUrl = `${baseUrl}${product.image}`;

				try {
					await productModel.findByIdAndUpdate(product._id, { image: fullUrl });
					updateCount++;
					console.log(
						`✅ Updated "${product.title}": ${product.image} -> ${fullUrl}`
							.green
					);
				} catch (updateError) {
					console.error(
						`❌ Failed to update product ${product._id}:`.red,
						updateError.message
					);
				}
			}
		}

		console.log(
			`\n🎉 Migration completed! Updated ${updateCount} out of ${productsWithRelativePaths.length} products`
				.green.bold
		);
	} catch (error) {
		console.error('❌ Migration failed:'.red, error.message);
		console.error('Full error:'.red, error);
	} finally {
		console.log('\n🔚 Closing database connection...'.blue);
		if (mongoose.connection.readyState === 1) {
			await mongoose.connection.close();
		}
		process.exit(0);
	}
};

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	migrateImageUrls();
}

export default migrateImageUrls;
