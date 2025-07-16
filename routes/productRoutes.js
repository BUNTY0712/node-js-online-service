import express from 'express';
const router = express.Router();
import upload from '../config/multer.js';
import {
	createProductController,
	getAllProductsController,
	deleteProductController,
	updateProductController,
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

export default router;
