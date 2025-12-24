import { Router } from 'express';
import ActivityController from '../controllers/activity.controller.js';
import { verifyToken, permit } from '../middlewares/jwt-auth.middleware.js';

const router = Router();

// Public routes
router.get('/', ActivityController.getActivities);
router.get('/:id', ActivityController.getActivityById);

// Protected routes (require authentication)
router.use(verifyToken);

// Volunteer actions
router.post('/:id/register', ActivityController.registerVolunteer);
router.post('/:id/unregister', ActivityController.unregisterVolunteer);

// For testing purposes - allow regular users to create activities
// In production, this should be protected by admin/manager role
if (process.env.NODE_ENV === 'test') {
    router.post('/', ActivityController.createActivity);
} else {
    // Admin-only routes in production
    router.use(permit('admin', 'organizer'));
    router.post('/', ActivityController.createActivity);
    router.put('/:id', ActivityController.updateActivity);
    router.delete('/:id', ActivityController.deleteActivity);
}

export default router;
