const express = require('express');
const router = express.Router();
const { 
  registerForProjectHandler, 
  listRegistrationsForProject, 
  listMyRegistrations, 
  updateRegistrationStatus 
} = require('../controllers/registration.controller.js');
const { verifyToken } = require('../middlewares/jwt-auth.middleware.js');
const { registerForProjectValidator } = require('../middlewares/registrationValidator.middleware');
const handleValidationErrors = require('../middlewares/validationHandler.middleware');

const {serveStaticPage} = require('../utils/serveStaticPage');

router.get('/', serveStaticPage('register-project.html'));

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
 */
router.post('/', verifyToken, registerForProjectValidator, handleValidationErrors, registerForProjectHandler);

/**
 * @swagger
 * /registrations/my-registrations:
 *   get:
 *     summary: Lấy danh sách đăng ký của người dùng hiện tại
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách đăng ký của người dùng hiện tại
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