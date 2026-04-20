const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const upload = require('../middleware/upload');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', authMiddleware, authController.getMe);
router.put('/profile', authMiddleware, authController.updateProfile);
router.get('/documents', authMiddleware, authController.getDocuments);
router.post('/documents', 
  authMiddleware,
  upload.fields([
    { name: 'cv', maxCount: 1 },
    { name: 'transcript', maxCount: 1 },
    { name: 'passport', maxCount: 1 }
  ]),
  authController.uploadDocuments
);

// Admin routes
router.get('/users', authMiddleware, roleMiddleware('admin'), authController.getAllUsers);

module.exports = router;