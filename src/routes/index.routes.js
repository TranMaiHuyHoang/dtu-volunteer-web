import { Router } from 'express';
const router = Router();

import { verifyToken } from '../middlewares/jwt-auth.middleware.js';
import serveStaticPage  from '../utils/serveStaticPage.js';

import auth from './auth.routes.js';
import profile from './welcome.js';
import activityRouter from './activity.routes.js';
import registrationRouter from './registration.routes.js';
import notificationRouter from './notification.routes.js';
import projectRouter from './project.routes.js';
import recordRouter from './record.routes.js';
// Tạm thời comment finance routes vì MySQL chưa được cấu hình
// const financeRouter = require('./finance.routes.js');
//const regCtrl = require('../controllers/registration.controller');
import clientLogRoute from './clientLog.routes.js';


router.get('/demo', serveStaticPage('demo.html'));

router.use('/activities', verifyToken, activityRouter);
router.use('/registrations', verifyToken, registrationRouter);
router.use('/', auth);
router.use('/profile', verifyToken, profile );
router.use('/notifications', notificationRouter);
router.use('/projects', projectRouter);
router.use('/records', verifyToken, recordRouter);
// Tạm thời comment finance routes
// router.use('/finance', financeRouter);

// router.get('/me', regCtrl.listMyRegistrations);

router.get('/auth/status', verifyToken, (req, res) => {
    
    // Server chỉ cần trả về 200 OK, payload tối thiểu (Không cần profile data!)
    res.status(200).json({ 
        authenticated: true,
        // Có thể thêm ID người dùng nếu cần thiết cho frontend:
        // userId: req.user.id 
    });
});
router.get('/list-history', verifyToken, serveStaticPage('list-history.html'));
router.get('/activity-history', verifyToken, serveStaticPage('activity-history.html'));
router.get('/profile', verifyToken, serveStaticPage('profile.html'));

router.use('/api', clientLogRoute);
router.use('/about', serveStaticPage('about.html'));
router.use('/impact', serveStaticPage('our_Impact.html'));
router.use('/activities', serveStaticPage('indexVolunteer.html'));

export default router;
