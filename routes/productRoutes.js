import express from 'express';
const router = express.Router();
import upload from '../config/multer.js';
import {
	createProductController,
	getAllProductsController,
	deleteProductController,
	updateProductController,
	getProductByIdController,
	searchProductsByTitleController,
	filterProductsByStateCityAreaController,
	getMostSearchedSixProductsController,
} from '../controllers/productController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

// Define routes for product operations
router.post(
	'/create-product',
	upload.single('image'),
	authenticateToken,
	createProductController
);
router.get('/get-all-product', authenticateToken, getAllProductsController);
router.get(
	'/get-all-product-by-id/:id',
	authenticateToken,
	getProductByIdController
);
router.delete(
	'/delete-product/:id',
	authenticateToken,
	deleteProductController
);
router.put(
	'/update-product/:id',
	upload.single('image'),
	authenticateToken,
	updateProductController
);

// Search and filter routes
router.get(
	'/search-products',
	authenticateToken,
	searchProductsByTitleController
);
router.get(
	'/filter-products',
	authenticateToken,
	filterProductsByStateCityAreaController
);
router.get(
	'/most-searched-products',
	authenticateToken,
	getMostSearchedSixProductsController
);

export default router;
