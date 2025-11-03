const express = require('express');
const router = express.Router();
const projectCtrl = require('../controllers/project.controller');
const { verifyToken, permit } = require('../middlewares/jwt-auth.middleware.js');

// router.get('/', projectCtrl.listProjects);

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Tạo một dự án mới (Organizer/Admin)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', verifyToken, permit('organizer', 'admin'), projectCtrl.createProjectHandler);


module.exports = router;