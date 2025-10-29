
const express = require('express');
const router = express.Router();
const { handleRegister, handleLogin, googleCallback } = require('../controllers/auth.controller');

const { loginValidator, registerValidator } = require('../middlewares/authValidator.middleware');
const handleValidationErrors = require('../middlewares/validationHandler.middleware');
const myPassport = require('../utils/passportConfig');


// Register a new user

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/register", (req, res) => {
  res.render("register");
});


router.get("/auth/google", myPassport.authenticate('google', { scope: ['profile', 'email'] }));

router.get("/auth/google/callback",
  myPassport.authenticate('google', {
    failureRedirect: "/",
    failureFlash: true, // Enable flash messages
    session: false             // QUAN TRỌNG: Tắt session vì chúng ta dùng JWT
  }), googleCallback);

router.post('/register', registerValidator, handleValidationErrors, handleRegister);

//Login user
router.post('/login', loginValidator, handleValidationErrors, handleLogin);

router.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) { return next(err); }
    return res.redirect('/');
  });
});


module.exports = router;