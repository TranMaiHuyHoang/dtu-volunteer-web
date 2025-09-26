
const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

const { loginValidator, registerValidator } = require('../middlewares/authValidator');
const handleValidationErrors = require('../middlewares/validationHandler');
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

router.get("/auth/google/callback", myPassport.authenticate('google', {
  failureRedirect: "/",
  failureFlash: true // Enable flash messages
})
, (req, res) => {
  res.redirect("/profile");
});

router.post('/register', registerValidator, handleValidationErrors, registerUser);

//Login user
router.post('/login',loginValidator , handleValidationErrors ,loginUser);

router.get("/logout", (req, res) => {
  req.logOut();
  res.redirect("/");
});


module.exports = router;