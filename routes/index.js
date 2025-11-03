const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middlewares/jwt-auth.middleware.js');

const auth = require('./auth.routes.js');
const profile = require('./welcome.js');
const activityRouter = require('./activity.routes.js');
const registrationRouter = require('./registration.routes.js');
const notificationRouter = require('./notification.routes.js');
const projectRouter = require('./project.routes.js');
//const regCtrl = require('../controllers/registration.controller');



router.use('/activities', verifyToken, activityRouter);
router.use('/registrations', verifyToken, registrationRouter);
router.use('/', auth);
router.use('/profile', verifyToken, profile );
router.use('/notifications', notificationRouter);
router.use('/projects', projectRouter);

// router.get('/me', regCtrl.listMyRegistrations);

module.exports = router;
