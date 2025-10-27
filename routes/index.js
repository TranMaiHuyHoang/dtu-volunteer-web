const express = require('express');
const router = express.Router();
const { verifyToken, verifyTokenAndAdminAuth } = require('../middlewares/jwt-auth.middleware.js');
var auth = require('./auth.js');
const profile = require('./welcome.js');
const activityRouter = require('./activityRoutes.js');
const registrationRouter = require('./registrationRoutes.js');


router.use('/activities', verifyToken, activityRouter);
router.use('/registrations', verifyToken, registrationRouter);
router.use('/', auth);
router.use('/profile', verifyToken, profile );

module.exports = router;
