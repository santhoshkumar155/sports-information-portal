const mongoose = require('mongoose');

const CATEGORIES = ['Cricket', 'Football', 'Basketball', 'Tennis', 'Hockey', 'Badminton', 'General'];

const newsSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    description: { type: String, required: [true, 'Description is required'], trim: true },
    content: { type: String, required: [true, 'Content is required'], trim: true },
    image: { type: String, default: '', trim: true },
    category: { type: String, required: [true, 'Category is required'], enum: { values: CATEGORIES, message: 'Invalid category' } },
    author: { type: String, required: [true, 'Author is required'], trim: true },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('News', newsSchema);
