const Team = require('../models/Team');

const FIELDS = ['name', 'sport', 'country', 'logo', 'coach', 'founded', 'description'];
const pick = (body = {}) => FIELDS.reduce((o, k) => (body[k] !== undefined ? ((o[k] = body[k]), o) : o), {});
const str = (v) => (typeof v === 'string' ? v.trim() : '');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/teams?search=&sport=&country=&limit=
exports.getTeams = async (req, res) => {
  const search = str(req.query.search);
  const sport = str(req.query.sport);
  const country = str(req.query.country);
  const limit = parseInt(req.query.limit, 10);

  const filter = {};
  if (sport) filter.sport = sport;
  if (country) filter.country = country;
  if (search) {
    const rx = new RegExp(esc(search), 'i');
    filter.$or = [{ name: rx }, { coach: rx }, { country: rx }];
  }

  let query = Team.find(filter).sort({ name: 1 });
  if (limit > 0) query = query.limit(Math.min(limit, 100));
  res.json(await query);
};

// GET /api/teams/:id
exports.getTeam = async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) return res.status(404).json({ message: 'Team not found' });
  res.json(team);
};

// POST /api/teams
exports.createTeam = async (req, res) => {
  const team = await Team.create(pick(req.body));
  res.status(201).json(team);
};

// PUT /api/teams/:id
exports.updateTeam = async (req, res) => {
  const team = await Team.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true });
  if (!team) return res.status(404).json({ message: 'Team not found' });
  res.json(team);
};

// DELETE /api/teams/:id
exports.deleteTeam = async (req, res) => {
  const team = await Team.findByIdAndDelete(req.params.id);
  if (!team) return res.status(404).json({ message: 'Team not found' });
  res.json({ message: 'Team deleted' });
};
