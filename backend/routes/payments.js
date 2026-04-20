const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// Public route
router.get('/info', paymentController.getPaymentInfo);

// Student routes
router.post('/request', authMiddleware, paymentController.requestService);
router.get('/my', authMiddleware, paymentController.getMyServices);

// Admin routes
router.get('/all', authMiddleware, roleMiddleware('admin'), paymentController.getAllServices);
router.put('/:service_id/confirm', authMiddleware, roleMiddleware('admin'), paymentController.confirmPayment);
router.put('/:service_id/reject', authMiddleware, roleMiddleware('admin'), paymentController.rejectPayment);

module.exports = router;