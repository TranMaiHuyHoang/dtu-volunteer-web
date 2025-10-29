const express = require('express');
const router = express.Router();
const { 
  registerForProject, 
  listRegistrationsForProject, 
  listMyRegistrations, 
  updateRegistrationStatus 
} = require('../controllers/registration.controller');
const { verifyToken } = require('../middlewares/jwt-auth.middleware.js');

/**
 * @swagger
 * /registrations:
 *   post:
 *     summary: Đăng ký tham gia dự án
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectId
 *             properties:
 *               projectId:
 *                 type: string
 *                 description: ID của dự án muốn đăng ký
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *       400:
 *         description: Thiếu thông tin bắt buộc
 *       404:
 *         description: Không tìm thấy dự án
 *       409:
 *         description: Đã đăng ký dự án này trước đó
 */
router.post('/', verifyToken, registerForProject);

/**
 * @swagger
 * /registrations/my-registrations:
 *   get:
 *     summary: Xem danh sách đăng ký của bản thân
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách các đăng ký của người dùng
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Registration'
 */
router.get('/my-registrations', verifyToken, listMyRegistrations);

/**
 * @swagger
 * /registrations/project/{projectId}:
 *   get:
 *     summary: Xem danh sách đăng ký của một dự án (dành cho chủ dự án)
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của dự án
 *     responses:
 *       200:
 *         description: Danh sách đăng ký của dự án
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Registration'
 */
router.get('/project/:projectId', verifyToken, listRegistrationsForProject);

/**
 * @swagger
 * /registrations/{id}:
 *   patch:
 *     summary: Cập nhật trạng thái đăng ký (phê duyệt/từ chối)
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của đăng ký cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected, pending]
 *                 description: Trạng thái mới của đăng ký
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 *       400:
 *         description: Trạng thái không hợp lệ
 *       403:
 *         description: Không có quyền thực hiện hành động
 *       404:
 *         description: Không tìm thấy đăng ký
 */
router.patch('/:id', verifyToken, updateRegistrationStatus);

module.exports = router;