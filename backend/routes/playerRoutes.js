const express = require('express');
const mongoose = require('mongoose');
const c = require('../controllers/playerController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

const router = express.Router();

// Reject malformed ids with 400 before they reach the database
router.param('id', (req, res, next, id) => {
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid id' });
  next();
});

router.get('/', c.getPlayers);
router.get('/:id', c.getPlayer);
router.post('/', protect, adminOnly, c.createPlayer);
router.put('/:id', protect, adminOnly, c.updatePlayer);
router.delete('/:id', protect, adminOnly, c.deletePlayer);

module.exports = router;
