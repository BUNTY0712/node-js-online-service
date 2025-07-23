import shopModel from '../models/shopModel.js';

export const createShop = async (req, res) => {
	try {
		const { user_id, shop_name, shop_address, phone_no, state, city, area } =
			req.body;

		// Validate required fields
		if (
			!user_id ||
			!shop_name ||
			!shop_address ||
			!phone_no ||
			!state ||
			!city ||
			!area
		) {
			return res.status(400).json({
				success: false,
				message:
					'Validation error: All fields (user_id, shop_name, shop_address, phone_no, state, city, area) are required.',
			});
		}

		const shop = new shopModel(req.body);
		await shop.save();
		res.status(201).json({
			success: true,
			message: 'Shop created successfully',
			data: shop,
		});
	} catch (error) {
		res.status(400).json({
			success: false,
			message:
				error.name === 'ValidationError'
					? 'Validation error: ' + error.message
					: 'Failed to create shop',
			error: error.message,
		});
	}
};

export const getShops = async (req, res) => {
	try {
		const shops = await shopModel.find();
		res.status(200).json({
			success: true,
			message: 'Shops retrieved successfully',
			data: shops,
		});
	} catch (error) {
		res.status(400).json({
			success: false,
			message: 'Failed to retrieve shops',
			error: error.message,
		});
	}
};

export const getShopById = async (req, res) => {
	try {
		const shop = await shopModel.findById(req.params.id);
		if (!shop) {
			return res.status(404).json({
				success: false,
				message: 'Shop not found',
			});
		}
		res.status(200).json({
			success: true,
			message: 'Shop retrieved successfully',
			data: shop,
		});
	} catch (error) {
		res.status(400).json({
			success: false,
			message: 'Failed to retrieve shop',
			error: error.message,
		});
	}
};

export const updateShop = async (req, res) => {
	try {
		const shop = await shopModel.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		if (!shop) {
			return res.status(404).json({
				success: false,
				message: 'Shop not found',
			});
		}
		res.status(200).json({
			success: true,
			message: 'Shop updated successfully',
			data: shop,
		});
	} catch (error) {
		res.status(400).json({
			success: false,
			message: 'Failed to update shop',
			error: error.message,
		});
	}
};

export const deleteShop = async (req, res) => {
	try {
		const shop = await shopModel.findByIdAndDelete(req.params.id);
		if (!shop) {
			return res.status(404).json({
				success: false,
				message: 'Shop not found',
			});
		}
		res.status(200).json({
			success: true,
			message: 'Shop deleted successfully',
			data: shop,
		});
	} catch (error) {
		res.status(400).json({
			success: false,
			message: 'Failed to delete shop',
			error: error.message,
		});
	}
};
