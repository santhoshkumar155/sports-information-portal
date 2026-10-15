const Match = require('../models/Match');

const FIELDS = ['sport', 'tournament', 'team1', 'team2', 'date', 'time', 'venue', 'status', 'team1Score', 'team2Score'];
const pick = (body = {}) => FIELDS.reduce((o, k) => (body[k] !== undefined ? ((o[k] = body[k]), o) : o), {});
const str = (v) => (typeof v === 'string' ? v.trim() : '');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SORTS = {
  dateAsc: { date: 1, time: 1 },
  dateDesc: { date: -1, time: -1 },
  sport: { sport: 1, date: 1 },
  tournament: { tournament: 1, date: 1 },
};

// GET /api/matches?search=&sport=&status=&date=YYYY-MM-DD&sort=&limit=
exports.getMatches = async (req, res) => {
  const search = str(req.query.search);
  const sport = str(req.query.sport);
  const status = str(req.query.status);
  const date = str(req.query.date);
  const sort = str(req.query.sort);
  const limit = parseInt(req.query.limit, 10);

  const filter = {};
  if (sport) filter.sport = sport;
  if (status) filter.status = status;
  if (search) {
    const rx = new RegExp(esc(search), 'i');
    filter.$or = [{ team1: rx }, { team2: rx }, { tournament: rx }, { venue: rx }];
  }
  if (date) {
    const start = new Date(date);
    if (isNaN(start.getTime())) return res.status(400).json({ message: 'Invalid date filter' });
    filter.date = { $gte: start, $lt: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
  }

  let query = Match.find(filter).sort(SORTS[sort] || SORTS.dateAsc);
  if (limit > 0) query = query.limit(Math.min(limit, 100));
  res.json(await query);
};

// GET /api/matches/:id
exports.getMatch = async (req, res) => {
  const match = await Match.findById(req.params.id);
  if (!match) return res.status(404).json({ message: 'Match not found' });
  res.json(match);
};

// POST /api/matches
exports.createMatch = async (req, res) => {
  const match = await Match.create(pick(req.body));
  res.status(201).json(match);
};

// PUT /api/matches/:id
exports.updateMatch = async (req, res) => {
  const match = await Match.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true });
  if (!match) return res.status(404).json({ message: 'Match not found' });
  res.json(match);
};

// DELETE /api/matches/:id
exports.deleteMatch = async (req, res) => {
  const match = await Match.findByIdAndDelete(req.params.id);
  if (!match) return res.status(404).json({ message: 'Match not found' });
  res.json({ message: 'Match deleted' });
};
