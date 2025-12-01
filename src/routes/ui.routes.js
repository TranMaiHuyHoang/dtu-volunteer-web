import express from 'express';
import { verifyToken, permit } from '../middlewares/jwt-auth.middleware.js';
import serveStaticPage from '../utils/serveStaticPage.js';

const router = express.Router();

// Static page routes with authentication
router.get('/list-history', verifyToken, serveStaticPage('list-history.html'));
router.get('/activity-history', verifyToken, serveStaticPage('activity-history.html'));
router.get('/profile/page', verifyToken, serveStaticPage('profile.html'));

// Public static pages
router.get('/about', serveStaticPage('about.html'));
router.get('/impact', serveStaticPage('our_Impact.html'));
router.get('/activities/page', serveStaticPage('indexVolunteer.html'));
router.get('/activitity-management', serveStaticPage('activity-management.html'));
router.get('/dashboard', verifyToken, permit('admin'), serveStaticPage('/test/dashboard.html'));
export default router;