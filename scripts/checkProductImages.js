/**
 * Script to check the current state of products and their image URLs
 */

import productModel from '../models/productModel.js';
import connectDB from '../config/db.js';
import dotenv from 'dotenv';
import colors from 'colors';
import mongoose from 'mongoose';

dotenv.config();

const checkProductImages = async () => {
	try {
		console.log('🔍 Checking current product image URLs...'.blue);

		// Connect to database
		await connectDB();
		console.log('✅ Connected to database'.green);

		// Get all products
		const products = await productModel
			.find({})
			.select('_id title image dealerId created_at');
		console.log(`📊 Total products found: ${products.length}`.yellow);

		if (products.length === 0) {
			console.log('⚠️  No products found in database'.yellow);
			return;
		}

		// Categorize images
		const relativeImages = [];
		const fullUrlImages = [];
		const noImages = [];

		products.forEach((product) => {
			if (!product.image) {
				noImages.push(product);
			} else if (product.image.startsWith('/uploads/')) {
				relativeImages.push(product);
			} else if (product.image.startsWith('http')) {
				fullUrlImages.push(product);
			} else {
				relativeImages.push(product); // Assume relative if not http
			}
		});

		console.log('\n📈 Image URL Analysis:'.blue);
		console.log(`✅ Products with full URLs: ${fullUrlImages.length}`.green);
		console.log(
			`⚠️  Products with relative paths: ${relativeImages.length}`.yellow
		);
		console.log(`❌ Products without images: ${noImages.length}`.red);

		if (relativeImages.length > 0) {
			console.log('\n🔗 Products with relative image paths:'.yellow);
			relativeImages.slice(0, 10).forEach((product, index) => {
				console.log(
					`${index + 1}. "${product.title}" (ID: ${product.dealerId}): ${
						product.image
					}`
				);
			});
			if (relativeImages.length > 10) {
				console.log(`... and ${relativeImages.length - 10} more`.gray);
			}
		}

		if (fullUrlImages.length > 0) {
			console.log('\n✅ Examples of products with full URLs:'.green);
			fullUrlImages.slice(0, 5).forEach((product, index) => {
				console.log(`${index + 1}. "${product.title}": ${product.image}`);
			});
		}

		if (noImages.length > 0) {
			console.log('\n❌ Products without images:'.red);
			noImages.slice(0, 5).forEach((product, index) => {
				console.log(
					`${index + 1}. "${product.title}" (ID: ${product.dealerId})`
				);
			});
			if (noImages.length > 5) {
				console.log(`... and ${noImages.length - 5} more`.gray);
			}
		}

		// Check if migration is needed
		if (relativeImages.length > 0) {
			console.log('\n🚨 Migration needed! Run: npm run migrate:images'.red);
		} else {
			console.log('\n🎉 All good! No migration needed.'.green);
		}
	} catch (error) {
		console.error('❌ Check failed:'.red, error.message);
		console.error('Full error:'.red, error);
	} finally {
		console.log('\n🔚 Closing database connection...'.blue);
		if (mongoose.connection.readyState === 1) {
			await mongoose.connection.close();
		}
		process.exit(0);
	}
};

checkProductImages();
