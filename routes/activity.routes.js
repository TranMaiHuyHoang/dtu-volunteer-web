const express = require('express');
const router = express.Router({ mergeParams: true }); // Để truy cập :activityId từ route cha
//const {listMyRegistrations, listRegistrationsForProject, registerForProject, updateRegistrationStatus}= require('../controllers/registration.controller');

const registerForActivity = (req, res) => {
    res.send("Register for activity");
};

const listActivityRegistrations = (req, res) => {
    res.send("List activity registrations");
};

/**
 * @swagger
 * /activities/{activityId}/registrations:
 *   post:
 *     summary: Đăng ký tham gia hoạt động cụ thể
 *     description: Cho phép người dùng đăng ký tham gia một hoạt động cụ thể bằng cách cung cấp ID của hoạt động.
 *     tags:
 *       - Activities
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của hoạt động cần đăng ký
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               uuid:
 *                 type: string
 *                 description: ID của người dùng đăng ký (hoặc lấy từ token)
 *               additionalInfo:
 *                 type: string
 *                 description: Thông tin bổ sung (nếu có)
 *     responses:
 *       200:
 *         description: Đăng ký thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Bạn đã đăng ký thành công hoạt động 'Vệ sinh Bãi biển 2025'.
 *                 data:
 *                   type: object
 *                   properties:
 *                     registrationId:
 *                       type: string
 *                       example: "789"
 *                     activityId:
 *                       type: string
 *                       example: "123"
 *                     userId:
 *                       type: string
 *                       example: Lấy từ token
 *                     registrationDate:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-10-21T10:00:00Z
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc thiếu thông tin
 *       404:
 *         description: Không tìm thấy hoạt động
 *       500:
 *         description: Lỗi máy chủ
 */
router.post('/:activityId/registrations', registerForActivity);

/**
 * @swagger
 * /activities/{activityId}/registrations:
 *   get:
 *     summary: Lấy danh sách người đăng ký hoạt động (chỉ dành cho quản trị viên)
 *     description: Chỉ dành cho quản trị viên. Trả về danh sách người dùng đã đăng ký tham gia hoạt động có ID tương ứng.
 *     tags:
 *       - Activities
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của hoạt động cần truy xuất danh sách đăng ký
 *     responses:
 *       200:
 *         description: Danh sách đăng ký được trả về thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Danh sách đăng ký hoạt động đã được truy xuất thành công.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       registrationId:
 *                         type: integer
 *                         example: 789
 *                       userId:
 *                         type: string
 *                         example: u123456
 *                       userName:
 *                         type: string
 *                         example: Nguyễn Văn A
 *                       registrationDate:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-10-21T10:00:00Z
 *       401:
 *         description: Không có quyền truy cập (không phải quản trị viên)
 *       404:
 *         description: Không tìm thấy hoạt động
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/:activityId/registrations', listActivityRegistrations);


module.exports = router;
