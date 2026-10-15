const mongoose = require('mongoose');

const SPORTS = ['Cricket', 'Football', 'Basketball', 'Tennis', 'Hockey', 'Badminton'];

const matchSchema = new mongoose.Schema(
  {
    sport: { type: String, required: [true, 'Sport is required'], enum: { values: SPORTS, message: 'Invalid sport' } },
    tournament: { type: String, required: [true, 'Tournament is required'], trim: true },
    team1: { type: String, required: [true, 'Team 1 is required'], trim: true },
    team2: { type: String, required: [true, 'Team 2 is required'], trim: true },
    date: { type: Date, required: [true, 'Date is required'] },
    time: { type: String, required: [true, 'Time is required'], match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be in HH:MM format'] },
    venue: { type: String, required: [true, 'Venue is required'], trim: true },
    status: { type: String, enum: { values: ['Upcoming', 'Live', 'Completed'], message: 'Invalid status' }, default: 'Upcoming' },
    team1Score: { type: String, default: '', trim: true },
    team2Score: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Match', matchSchema);
