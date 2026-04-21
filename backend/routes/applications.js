const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const upload = require('../middleware/upload');

// Student routes
router.post('/', 
  authMiddleware, 
  upload.fields([
    { name: 'cv', maxCount: 1 },
    { name: 'transcript', maxCount: 1 },
    { name: 'passport', maxCount: 1 },
    { name: 'other', maxCount: 1 }
  ]), 
  applicationController.apply
);
router.get('/my', authMiddleware, applicationController.getMyApplications);

// Admin routes
router.get('/all', authMiddleware, roleMiddleware('admin'), applicationController.getAllApplications);
router.get('/:id', authMiddleware, roleMiddleware('admin'), applicationController.getOne);
router.put('/:id/status', authMiddleware, roleMiddleware('admin'), applicationController.updateStatus);

// Quick apply using saved profile documents
router.post('/quick', authMiddleware, applicationController.quickApply);
module.exports = router;
