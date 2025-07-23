import express from 'express';
import {
	createShop,
	getShops,
	getShopById,
	updateShop,
	deleteShop,
} from '../controllers/shopController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-shop', authenticateToken, createShop);
router.get('/get-shops', authenticateToken, getShops);
router.get('/get-shop/:id', authenticateToken, getShopById);
router.put('/update-shop/:id', authenticateToken, updateShop);
router.delete('/delete-shop/:id', authenticateToken, deleteShop);

export default router;
