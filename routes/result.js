const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const Exam = require('../models/Exam');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.post('/submit', verifyToken, async (req, res) => {
  try {
    const { examId, answers, warnings, tabSwitches, faceNotDetected, multipleFaces, phoneDetected } = req.body;
    const exam = await Exam.findById(examId);
    if (!exam)
      return res.status(404).json({ message: 'Exam not found' });

    let score = 0;
    exam.questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) score++;
    });

    const percentage = (score / exam.questions.length) * 100;
    const status = percentage >= 50 ? 'pass' : 'fail';

    await Result.create({
      student: req.user.id,
      exam: examId,
      answers, score, warnings,
      tabSwitches, faceNotDetected,
      multipleFaces, phoneDetected, status
    });

    res.json({ message: 'Exam submitted ✅', score, percentage, status });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/all', verifyToken, isAdmin, async (req, res) => {
  try {
    const results = await Result.find()
      .populate('student', 'name email')
      .populate('exam', 'title');
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/my', verifyToken, async (req, res) => {
  try {
    const results = await Result.find({ student: req.user.id })
      .populate('exam', 'title');
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;