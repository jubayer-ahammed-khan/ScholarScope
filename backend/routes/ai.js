const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/auth');

// AI Routes
router.post('/chat', aiController.chat);
router.get('/recommendations', authMiddleware, aiController.getRecommendations);

module.exports = router;