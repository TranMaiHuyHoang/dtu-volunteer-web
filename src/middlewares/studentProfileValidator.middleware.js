// registrationValidator.middleware.js - SỬ DỤNG ESM

// Thay thế require bằng import cho Named Export

import { phoneRules, contactEmailRules, createOptionalTextRule } from './validationRules/baseRulesValidate.js';
import { fullNameRules, classRules, majorRules, dateOfBirthRules, skillsRules} from './validationRules/studentProfileValidate.js';
import { finalizeValidation } from '../utils/finalizeValidation.utils.js';
// Quy tắc validation cho projectId
const createProfileRules = [
   ...phoneRules,
   ...contactEmailRules,
   ...fullNameRules,
   ...createOptionalTextRule('bio'),
   ...classRules,
   ...majorRules,
   ...dateOfBirthRules,
   ...skillsRules,
];


export const studentProfileValidator = {
    create: finalizeValidation(createProfileRules),
    update: finalizeValidation(createProfileRules) 
};