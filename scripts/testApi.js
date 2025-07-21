/**
 * Simple script to test API endpoints after deployment
 */

const testApiEndpoints = async () => {
	const baseUrl = 'https://node-js-online-service.onrender.com';

	console.log('🧪 Testing API endpoints...\n');

	// Test 1: Root endpoint
	try {
		console.log('1️⃣ Testing root endpoint...');
		const response = await fetch(`${baseUrl}/`);
		const text = await response.text();
		console.log(`   Status: ${response.status}`);
		console.log(`   Response: ${text}`);
		console.log(`   ✅ Root endpoint works!\n`);
	} catch (error) {
		console.log(`   ❌ Root endpoint failed: ${error.message}\n`);
	}

	// Test 2: Get all products
	try {
		console.log('2️⃣ Testing get all products...');
		const response = await fetch(`${baseUrl}/api/products/get-all-product`);
		const data = await response.json();
		console.log(`   Status: ${response.status}`);
		console.log(`   Products count: ${data.products?.length || 0}`);

		if (data.products && data.products.length > 0) {
			console.log(`   Sample product image: ${data.products[0].image}`);
		}
		console.log(`   ✅ Products endpoint works!\n`);
	} catch (error) {
		console.log(`   ❌ Products endpoint failed: ${error.message}\n`);
	}

	// Test 3: Check if images have full URLs
	try {
		console.log('3️⃣ Checking image URLs...');
		const response = await fetch(`${baseUrl}/api/products/get-all-product`);
		const data = await response.json();

		if (data.products && data.products.length > 0) {
			const productsWithImages = data.products.filter((p) => p.image);
			console.log(`   Products with images: ${productsWithImages.length}`);

			productsWithImages.slice(0, 3).forEach((product, index) => {
				const isFullUrl = product.image.startsWith('http');
				console.log(
					`   Image ${index + 1}: ${product.image} ${isFullUrl ? '✅' : '❌'}`
				);
			});
		}
		console.log('');
	} catch (error) {
		console.log(`   ❌ Image URL check failed: ${error.message}\n`);
	}

	console.log('🏁 API testing complete!');
};

// Run the test
testApiEndpoints().catch(console.error);
