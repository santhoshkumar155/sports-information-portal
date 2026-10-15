const express = require('express');
const c = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

const router = express.Router();

router.post('/register', c.register);
router.post('/login', c.login);
router.get('/profile', protect, c.getProfile);
router.put('/profile', protect, c.updateProfile);
router.get('/users', protect, adminOnly, c.getUsers);

module.exports = router;
