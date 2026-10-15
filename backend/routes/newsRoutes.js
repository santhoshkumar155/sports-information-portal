const express = require('express');
const mongoose = require('mongoose');
const c = require('../controllers/newsController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

const router = express.Router();

// Reject malformed ids with 400 before they reach the database
router.param('id', (req, res, next, id) => {
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid id' });
  next();
});

router.get('/', c.getNews);
router.get('/:id', c.getArticle);
router.post('/', protect, adminOnly, c.createArticle);
router.put('/:id', protect, adminOnly, c.updateArticle);
router.delete('/:id', protect, adminOnly, c.deleteArticle);

module.exports = router;
