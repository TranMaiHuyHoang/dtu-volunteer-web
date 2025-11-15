import { Router } from 'express';
const router = Router();
import { createNotification, listNotificationsForUser, getNotificationById, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications } from '../controllers/notification.controller.js';
import { verifyToken, permit } from '../middlewares/jwt-auth.middleware.js';

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Quản lý thông báo người dùng
 */

/**
 * @swagger
 * /notifications:
 *   post:
 *     summary: Tạo thông báo mới (Admin)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, message]
 *             properties:
 *               userId:
 *                 type: string
 *               message:
 *                 type: string
 */
router.post('/', verifyToken, permit('admin'), createNotification);

/**
 * @swagger
 * /notifications/me:
 *   get:
 *     summary: Lấy danh sách thông báo của người dùng hiện tại
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.get('/me', verifyToken, listNotificationsForUser);

/**
 * @swagger
 * /notifications/{id}:
 *   get:
 *     summary: Lấy chi tiết thông báo
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:id', verifyToken, getNotificationById);

/**
 * @swagger
 * /notifications/{id}/read:
 *   put:
 *     summary: Đánh dấu thông báo là đã đọc
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.put('/:id/read', verifyToken, markAsRead);

/**
 * @swagger
 * /notifications/read-all:
 *   put:
 *     summary: Đánh dấu tất cả thông báo là đã đọc
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.put('/read-all', verifyToken, markAllAsRead);

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Xóa một thông báo
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/:id', verifyToken, deleteNotification);

/**
 * @swagger
 * /notifications:
 *   delete:
 *     summary: Xóa tất cả thông báo của người dùng
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/', verifyToken, deleteAllNotifications);

export default router;
