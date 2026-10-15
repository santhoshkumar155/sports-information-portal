const Player = require('../models/Player');

const FIELDS = ['name', 'sport', 'country', 'team', 'position', 'age', 'jerseyNumber', 'image', 'biography', 'statistics'];
const pick = (body = {}) => FIELDS.reduce((o, k) => (body[k] !== undefined ? ((o[k] = body[k]), o) : o), {});
const str = (v) => (typeof v === 'string' ? v.trim() : '');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/players?search=&sport=&country=&team=&limit=
exports.getPlayers = async (req, res) => {
  const search = str(req.query.search);
  const sport = str(req.query.sport);
  const country = str(req.query.country);
  const team = str(req.query.team);
  const limit = parseInt(req.query.limit, 10);

  const filter = {};
  if (sport) filter.sport = sport;
  if (country) filter.country = country;
  if (team) filter.team = team;
  if (search) {
    const rx = new RegExp(esc(search), 'i');
    filter.$or = [{ name: rx }, { team: rx }, { position: rx }, { country: rx }];
  }

  let query = Player.find(filter).sort({ name: 1 });
  if (limit > 0) query = query.limit(Math.min(limit, 100));
  res.json(await query);
};

// GET /api/players/:id
exports.getPlayer = async (req, res) => {
  const player = await Player.findById(req.params.id);
  if (!player) return res.status(404).json({ message: 'Player not found' });
  res.json(player);
};

// POST /api/players
exports.createPlayer = async (req, res) => {
  const player = await Player.create(pick(req.body));
  res.status(201).json(player);
};

// PUT /api/players/:id
exports.updatePlayer = async (req, res) => {
  const player = await Player.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true });
  if (!player) return res.status(404).json({ message: 'Player not found' });
  res.json(player);
};

// DELETE /api/players/:id
exports.deletePlayer = async (req, res) => {
  const player = await Player.findByIdAndDelete(req.params.id);
  if (!player) return res.status(404).json({ message: 'Player not found' });
  res.json({ message: 'Player deleted' });
};
