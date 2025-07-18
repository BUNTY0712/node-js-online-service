import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
	{
		id: {
			type: Number,
			unique: true,
			index: true,
		},
		dealerId: {
			type: Number,
		},
		title: {
			type: String,
		},
		description: {
			type: String,
		},
		image: {
			type: String,
		},
		price: {
			type: String,
		},
		perItem: {
			type: String,
		},
		shopName: {
			type: String,
		},
		shopAddress: {
			type: String,
		},
		state: {
			type: String,
		},
		city: {
			type: String,
		},
		area: {
			type: String,
		},
		category: {
			type: String,
		},
		productCreatedBy: {
			type: String,
		},
		phone: {
			type: Number,
		},
	},
	{
		timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
	}
);

ProductSchema.pre('save', async function (next) {
	try {
		if (!this.isNew || this.id) {
			return next(); // If not a new document or id already set, skip auto-increment logic
		}

		// Find the highest existing id and increment
		const lastProduct = await this.constructor.findOne(
			{},
			{},
			{ sort: { id: -1 } }
		);

		if (lastProduct && lastProduct.id) {
			this.id = lastProduct.id + 1;
		} else {
			this.id = 1;
		}

		next();
	} catch (error) {
		console.error('Error in product pre-save middleware:', error);
		// If there's an error, try with a random number to avoid conflicts
		this.id = Date.now();
		next();
	}
});

const productModel = mongoose.model('Product', ProductSchema);

export default productModel;
