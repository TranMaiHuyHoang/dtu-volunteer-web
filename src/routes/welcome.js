import { Router } from 'express';
const router = Router();
import serveStaticPage from '../utils/serveStaticPage.js';
// Route để serve trang HTML profile
router.get('/page', serveStaticPage('profile.html'));

// Route API để lấy thông tin profile
router.get("/", (req, res) => {
  res.send({user: req.user});
});

export default router;