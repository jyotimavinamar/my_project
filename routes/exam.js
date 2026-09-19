const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Create Exam
router.post('/create', verifyToken, isAdmin, async (req, res) => {
  try {
    const { title, duration, questions } = req.body;
    const exam = await Exam.create({
      title,
      duration,
      createdBy: req.user.id,
      questions
    });
    res.status(201).json({ message: 'Exam created successfully ✅', exam });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all exams
router.get('/all', verifyToken, async (req, res) => {
  try {
    const exams = await Exam.find();
    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;