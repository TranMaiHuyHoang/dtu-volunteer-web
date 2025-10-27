const express = require('express');
const router = express.Router();

const registrationController = {
    cancelRegistration: (req, res) => { /* Logic Hủy đăng ký */ res.send("PATCH: Hủy đăng ký " + req.params.registrationId); },
    createRegistration: (req, res) => { /* Logic Tạo đăng ký */ res.send("POST: Tạo đăng ký mới"); },
    listRegistrations: (req, res) => { /* Logic Lấy danh sách đăng ký */ res.send("GET: Lấy danh sách đăng ký"); }
};

/**
 * @swagger
 * /registrations:
 *   get:
 *     summary: Lấy danh sách tất cả bản đăng ký (chỉ dành cho quản trị viên)
 *     description: Trả về danh sách các bản đăng ký hoạt động của người dùng. Chỉ dành cho quản trị viên để theo dõi và quản lý.
 *     tags:
 *       - Registrations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Truy xuất danh sách đăng ký thành công
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
 *                   example: Danh sách đăng ký đã được truy xuất thành công.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       registrationId:
 *                         type: integer
 *                         example: 789
 *                       activityId:
 *                         type: integer
 *                         example: 123
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
 *         description: Không có quyền truy cập (chỉ dành cho quản trị viên)
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/', registrationController.listRegistrations);

/**
 * @swagger
 * /registrations/{registrationId}:
 *   get:
 *     summary: Lấy thông tin đăng ký cụ thể
 *     description: Trả về thông tin chi tiết của một đăng ký dựa trên ID được cung cấp.
 *     tags:
 *       - Registrations
 *     parameters:
 *       - in: path
 *         name: registrationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của đăng ký cần truy xuất
 *     responses:
 *       200:
 *         description: Trả về thông tin đăng ký thành công
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "GET: Thông tin đăng ký 12345"
 *       400:
 *         description: Yêu cầu không hợp lệ
 *       404:
 *         description: Không tìm thấy đăng ký với ID đã cung cấp
 */
router.get('/:registrationId', (req, res) => {
    // Logic Lấy thông tin đăng ký cụ thể
    res.send("GET: Thông tin đăng ký " + req.params.registrationId);
})

/**
 * @swagger
 * /registrations/{registrationId}:
 *   patch:
 *     summary: Hủy đăng ký (Cập nhật trạng thái)
 *     tags:
 *       - Registrations
 *     parameters:
 *       - in: path
 *         name: registrationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Hủy đăng ký thành công
 *       404:
 *         description: Không tìm thấy đăng ký
 */
router.patch('/:registrationId', registrationController.cancelRegistration);


/**
 * @swagger
 * /registrations/{registrationId}:
 *   delete:
 *     summary: Xóa đăng ký
 *     description: Xóa một đăng ký cụ thể theo ID. Hành động này không thể hoàn tác.
 *     tags:
 *       - Registrations
 *     parameters:
 *       - in: path
 *         name: registrationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của đăng ký cần xóa
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy đăng ký
 *       500:
 *         description: Lỗi máy chủ
 */
router.delete('/:registrationId', (req, res) => {
    // Logic Xóa đăng ký
    res.send("DELETE: Xóa đăng ký " + req.params.registrationId);
});


// Bạn có thể thêm các route khác cho đăng ký ở đây (GET /:registrationId)



module.exports = router;