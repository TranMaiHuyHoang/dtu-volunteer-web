import express from 'express';

import {getProfile, createProfile, deleteProfile, updateProfile} from '../controllers/studentProfile.controller.js';

const router = express.Router();

router.route('/')
    .get(getProfile)
    .post(createProfile)
    .put(updateProfile)

router.route('/:id')
    .delete(deleteProfile);

export default router;