// passportConfig.js - SỬ DỤNG ESM

import passport from 'passport';
// Bỏ dòng này: const { use, serializeUser, deserializeUser } = passport;
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import googleVerifyCallback from '../services/passportVerify.js';
import logger from '../config/logger.js';
const { info, debug } = logger;

import 'dotenv/config';
import urlConfig from '../config/urlConfig.js';

const GOOGLE_CALLBACK_PATH = "/auth/google/callback";

// SỬA LỖI: Gọi passport.use() thay vì use()
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${urlConfig.baseUrl}${GOOGLE_CALLBACK_PATH}`,
}, googleVerifyCallback)
);

// SỬA LỖI: Gọi passport.serializeUser()
passport.serializeUser((user, done) => {
    info(`Serializing user with ID: ${user.id}`);
    debug('User data being serialized: ' + JSON.stringify(user, null, 2));
    done(null, user.id);
});

// SỬA LỖI: Gọi passport.deserializeUser()
passport.deserializeUser((user, done) => {
    info(`Deserializing user with ID: ${user}`);
    done(null, user);
});

export default passport;