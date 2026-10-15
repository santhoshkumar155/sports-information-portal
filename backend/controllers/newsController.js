const News = require('../models/News');

const FIELDS = ['title', 'description', 'content', 'image', 'category', 'author', 'publishedAt'];
const pick = (body = {}) => FIELDS.reduce((o, k) => (body[k] !== undefined && body[k] !== '' ? ((o[k] = body[k]), o) : o), {});
const str = (v) => (typeof v === 'string' ? v.trim() : '');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/news?search=&category=&limit=   (latest first)
exports.getNews = async (req, res) => {
  const search = str(req.query.search);
  const category = str(req.query.category);
  const limit = parseInt(req.query.limit, 10);

  const filter = {};
  if (category) filter.category = category;
  if (search) {
    const rx = new RegExp(esc(search), 'i');
    filter.$or = [{ title: rx }, { description: rx }, { author: rx }];
  }

  let query = News.find(filter).sort({ publishedAt: -1 });
  if (limit > 0) query = query.limit(Math.min(limit, 100));
  res.json(await query);
};

// GET /api/news/:id
exports.getArticle = async (req, res) => {
  const article = await News.findById(req.params.id);
  if (!article) return res.status(404).json({ message: 'Article not found' });
  res.json(article);
};

// POST /api/news
exports.createArticle = async (req, res) => {
  const article = await News.create(pick(req.body));
  res.status(201).json(article);
};

// PUT /api/news/:id
exports.updateArticle = async (req, res) => {
  const article = await News.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true });
  if (!article) return res.status(404).json({ message: 'Article not found' });
  res.json(article);
};

// DELETE /api/news/:id
exports.deleteArticle = async (req, res) => {
  const article = await News.findByIdAndDelete(req.params.id);
  if (!article) return res.status(404).json({ message: 'Article not found' });
  res.json({ message: 'Article deleted' });
};
