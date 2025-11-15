import { Router } from 'express';
import { verifyToken } from '../middlewares/jwt-auth.middleware.js';
import serveStaticPage from '../utils/serveStaticPage.js';
import { createRecord, listRecords, getRecord, updateRecord, deleteRecord } from '../controllers/record.controller.js';

const router = Router();

// Serve trang quản lý hồ sơ (records)
router.get('/manage', verifyToken, serveStaticPage('record-management.html'));

// APIs CRUD
router.get('/', verifyToken, listRecords);
router.post('/', verifyToken, createRecord);
router.get('/:id', verifyToken, getRecord);
router.put('/:id', verifyToken, updateRecord);
router.delete('/:id', verifyToken, deleteRecord);

export default router;


