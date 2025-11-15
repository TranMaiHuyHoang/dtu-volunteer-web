import { Router } from 'express';
const router = Router();
import { getUserFinance, addTransaction } from '../controllers/finance.controller';
import { verifyToken, permit } from '../middlewares/jwt-auth.middleware.js';

/**
 * @swagger
 * tags:
 *   name: Finance
 *   description: Quản lý tài chính người dùng
 */

/**
 * @swagger
 * /finance/user/{mongoUserId}:
 *   get:
 *     summary: Lấy thông tin tài chính người dùng
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mongoUserId
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/user/:mongoUserId', verifyToken, getUserFinance);

/**
 * @swagger
 * /finance/transaction:
 *   post:
 *     summary: Thêm giao dịch mới
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, amount, type, description]
 *             properties:
 *               userId:
 *                 type: number
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [deposit, withdraw]
 *               description:
 *                 type: string
 */
router.post('/transaction', verifyToken, addTransaction);

export default router;
