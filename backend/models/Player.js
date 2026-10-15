const mongoose = require('mongoose');

const SPORTS = ['Cricket', 'Football', 'Basketball', 'Tennis', 'Hockey', 'Badminton'];

const playerSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Player name is required'], trim: true },
    sport: { type: String, required: [true, 'Sport is required'], enum: { values: SPORTS, message: 'Invalid sport' } },
    country: { type: String, required: [true, 'Country is required'], trim: true },
    team: { type: String, required: [true, 'Team is required'], trim: true },
    position: { type: String, required: [true, 'Position is required'], trim: true },
    age: { type: Number, required: [true, 'Age is required'], min: [10, 'Age must be at least 10'], max: [60, 'Age must be at most 60'] },
    jerseyNumber: { type: Number, required: [true, 'Jersey number is required'], min: [0, 'Jersey number cannot be negative'], max: [999, 'Jersey number is too large'] },
    image: { type: String, default: '', trim: true },
    biography: { type: String, default: '', trim: true },
    statistics: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Player', playerSchema);
