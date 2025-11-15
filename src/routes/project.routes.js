import { Router } from 'express';
const router = Router();
import { listProjectsHandler, createProjectHandler } from '../controllers/project.controller.js';
import { verifyToken, permit } from '../middlewares/jwt-auth.middleware.js';
import serveStaticPage from '../utils/serveStaticPage.js';
// Route để serve trang HTML list-projects
router.get('/list', verifyToken, serveStaticPage('list-projects.html'));

// Route để serve trang HTML create-project
router.get('/create', verifyToken, permit('organizer', 'admin'), serveStaticPage('create-project.html'));

// Route API để lấy danh sách projects
router.get('/', verifyToken, listProjectsHandler);

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Tạo một dự án mới (Organizer/Admin)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', verifyToken, permit('organizer', 'admin'), createProjectHandler);


export default router;