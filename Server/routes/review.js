const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review');
const { authenticate } = require('../Middlewares/authMiddleware');

// Get all reviews for a specific college (public)
router.get('/college/:collegeId', reviewController.getReviewsByCollege);

// Get all reviews by logged-in user (protected)
router.get('/user', authenticate, reviewController.getReviewsByUser);

// Check if user has reviewed ANY college (protected)
router.get('/check', authenticate, reviewController.checkUserReview);

// Create a new review (protected)
router.post('/', authenticate, reviewController.createReview);

// Update a review (protected)
router.patch('/:id', authenticate, reviewController.updateReview);

// Delete a review (protected)
router.delete('/:id', authenticate, reviewController.deleteReview);

module.exports = router;
