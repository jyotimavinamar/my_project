const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
  answers: [String],
  score: Number,
  warnings: { type: Number, default: 0 },
  tabSwitches: { type: Number, default: 0 },
  faceNotDetected: { type: Number, default: 0 },
  multipleFaces: { type: Number, default: 0 },
  phoneDetected: { type: Number, default: 0 },
  status: { type: String, enum: ['pass', 'fail'], default: 'fail' }
}, { timestamps: true });

module.exports = mongoose.model('Result', resultSchema);