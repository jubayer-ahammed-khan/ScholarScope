const express = require('express');
const router = express.Router();
const scholarshipController = require('../controllers/scholarshipController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// Public routes
router.get('/', scholarshipController.getAll);
router.get('/:id', scholarshipController.getOne);

// Admin only routes
router.post('/', authMiddleware, roleMiddleware('admin'), scholarshipController.create);
router.put('/:id', authMiddleware, roleMiddleware('admin'), scholarshipController.update);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), scholarshipController.remove);

module.exports = router;