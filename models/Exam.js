const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [String],
  correctAnswer: { type: String, required: true }
});

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  duration: { type: Number, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  questions: [questionSchema]
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);