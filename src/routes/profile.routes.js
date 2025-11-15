import { Router } from 'express';
import { verifyToken } from '../middlewares/jwt-auth.middleware.js';
import serveStaticPage from '../utils/serveStaticPage.js';
import { createProfile, listProfiles, getProfile, updateProfile, deleteProfile } from '../controllers/profile.controller.js';

const router = Router();

// Serve trang quản lý hồ sơ
router.get('/manage', verifyToken, serveStaticPage('profile-management.html'));

// APIs CRUD
router.get('/', verifyToken, listProfiles);
router.post('/', verifyToken, createProfile);
router.get('/:id', verifyToken, getProfile);
router.put('/:id', verifyToken, updateProfile);
router.delete('/:id', verifyToken, deleteProfile);

export default router;


