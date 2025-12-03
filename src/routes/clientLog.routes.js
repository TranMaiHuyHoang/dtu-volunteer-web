import { Router } from 'express';
const router = Router();
import { receiveClientLog } from '../controllers/clientLog.controller.js';

router.post('/client-log', receiveClientLog);

export default router;