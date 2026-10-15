const mongoose = require('mongoose');

const SPORTS = ['Cricket', 'Football', 'Basketball', 'Tennis', 'Hockey', 'Badminton'];

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Team name is required'], trim: true },
    sport: { type: String, required: [true, 'Sport is required'], enum: { values: SPORTS, message: 'Invalid sport' } },
    country: { type: String, required: [true, 'Country is required'], trim: true },
    logo: { type: String, default: '', trim: true },
    coach: { type: String, required: [true, 'Coach is required'], trim: true },
    founded: { type: Number, required: [true, 'Founded year is required'], min: [1800, 'Founded year must be 1800 or later'], max: [new Date().getFullYear(), 'Founded year cannot be in the future'] },
    description: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Team', teamSchema);
