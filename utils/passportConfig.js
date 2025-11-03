const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const googleVerifyCallback = require('../services/passportVerify');
const logger = require('../config/logger');
require('dotenv').config();


passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/callback",
}, googleVerifyCallback)
);

passport.serializeUser((user, done) => {
  logger.info(`Serializing user with ID: ${user.id}`);
  logger.debug('User data being serialized: ' + JSON.stringify(user, null, 2));  
  done(null, user.id);
});

passport.deserializeUser((user, done) => {
  logger.info(`Deserializing user with ID: ${user}`);
  done(null, user);
});

module.exports = passport;
