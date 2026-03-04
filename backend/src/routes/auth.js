const express = require('express');
const router = express.Router();
const { login, logout } = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { loginLimiter } = require('../middlewares/rateLimiter');

router.post('/login', loginLimiter, login);
router.post('/logout', authMiddleware, logout);

module.exports = router;
