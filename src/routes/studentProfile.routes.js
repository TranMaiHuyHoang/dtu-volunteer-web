import express from 'express';

import * as studentProfileController from '../controllers/studentProfile.controller.js';

const router = express.Router();

router.route('/')
    .get(studentProfileController.getProfiles)
    .post(studentProfileController.createProfile);

router.route('/:id')
    .put(studentProfileController.updateProfile)
    .delete(studentProfileController.deleteProfile);

export default router;