const express = require('express');
const router = express.Router();
const { serveStaticPage } = require('../utils/serveStaticPage');

// Route để serve trang HTML profile
router.get('/page', serveStaticPage('profile.html'));

// Route API để lấy thông tin profile
router.get("/", (req, res) => {
  res.send({user: req.user});
});

module.exports = router;