const express = require('express');
const Match = require('../models/Match');
const Team = require('../models/Team');
const Player = require('../models/Player');
const News = require('../models/News');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

const router = express.Router();

const counts = async () => {
  const [matches, teams, players, news] = await Promise.all([
    Match.countDocuments(),
    Team.countDocuments(),
    Player.countDocuments(),
    News.countDocuments(),
  ]);
  return { matches, teams, players, news };
};

// GET /api/dashboard/stats  - public totals used by the home page
router.get('/stats', async (req, res) => {
  const base = await counts();
  const [upcoming, live, completed, bySport] = await Promise.all([
    Match.countDocuments({ status: 'Upcoming' }),
    Match.countDocuments({ status: 'Live' }),
    Match.countDocuments({ status: 'Completed' }),
    Match.aggregate([{ $group: { _id: '$sport', count: { $sum: 1 } } }]),
  ]);
  res.json({
    ...base,
    matchStatus: { upcoming, live, completed },
    matchesBySport: Object.fromEntries(bySport.map((s) => [s._id, s.count])),
  });
});

// GET /api/dashboard/admin-stats  - admin only, adds the user count
router.get('/admin-stats', protect, adminOnly, async (req, res) => {
  const base = await counts();
  const users = await User.countDocuments();
  res.json({ ...base, users });
});

module.exports = router;
