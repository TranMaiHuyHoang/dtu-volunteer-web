const express = require('express');
const router = express.Router();
const projectCtrl = require('../controllers/project.controller');
const { verifyToken, permit } = require('../middlewares/jwt-auth.middleware.js');
const { serveStaticPage } = require('../utils/serveStaticPage');

// Route để serve trang HTML list-projects
router.get('/list', verifyToken, serveStaticPage('list-projects.html'));

// Route để serve trang HTML create-project
router.get('/create', verifyToken, permit('organizer', 'admin'), serveStaticPage('create-project.html'));

// Route API để lấy danh sách projects
router.get('/', verifyToken, projectCtrl.listProjectsHandler);

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