const Review = require('../models/review');

// Get all reviews for a specific college
exports.getReviewsByCollege = async (req, res) => {
    try {
        const { collegeId } = req.params;
        const reviews = await Review.find({ collegeId }).sort({ createdAt: -1 });
        return res.status(200).json(reviews);
    } catch (error) {
        console.log(`Error: ${error.message}`);
        return res.status(400).send({ message: 'Error fetching reviews' });
    }
};

// Get all reviews by a specific user
exports.getReviewsByUser = async (req, res) => {
    try {
        const userId = req.user.id; // From auth middleware
        const reviews = await Review.find({ userId }).sort({ createdAt: -1 });
        return res.status(200).json(reviews);
    } catch (error) {
        console.log(`Error: ${error.message}`);
        return res.status(400).send({ message: 'Error fetching user reviews' });
    }
};

// Create a new review
exports.createReview = async (req, res) => {
    try {
        const { collegeId, collegeName, rating, comment, images } = req.body;
        const userId = req.user.id;
        const reviewer = req.user.username;

        // Check if user has already submitted ANY review (one review per user total)
        const existingReview = await Review.findOne({ userId });
        if (existingReview) {
            return res.status(403).send({
                message: 'You have already submitted a review. Each user can only submit one review total.',
                existingReview: {
                    collegeName: existingReview.collegeName,
                    createdAt: existingReview.createdAt
                }
            });
        }

        const newReview = new Review({
            collegeId,
            collegeName,
            reviewer,
            userId,
            rating,
            comment,
            images: images || []
        });

        await newReview.save();
        return res.status(201).json({ message: 'Review added successfully', review: newReview });
    } catch (error) {
        console.log(`Error: ${error.message}`);
        return res.status(400).send({ message: 'Error creating review' });
    }
};

// Update a review
exports.updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment, images } = req.body;
        const userId = req.user.id;

        // Find review and check ownership
        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).send({ message: 'Review not found' });
        }

        if (review.userId.toString() !== userId) {
            return res.status(403).send({ message: 'You can only update your own reviews' });
        }

        // Update fields
        if (rating !== undefined) review.rating = rating;
        if (comment !== undefined) review.comment = comment;
        if (images !== undefined) review.images = images;

        await review.save();
        return res.status(200).json({ message: 'Review updated successfully', review });
    } catch (error) {
        console.log(`Error: ${error.message}`);
        return res.status(400).send({ message: 'Error updating review' });
    }
};

// Delete a review
exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Find review and check ownership
        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).send({ message: 'Review not found' });
        }

        if (review.userId.toString() !== userId) {
            return res.status(403).send({ message: 'You can only delete your own reviews' });
        }

        await Review.findByIdAndDelete(id);
        return res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.log(`Error: ${error.message}`);
        return res.status(400).send({ message: 'Error deleting review' });
    }
};

// Check if user has reviewed ANY college
exports.checkUserReview = async (req, res) => {
    try {
        const userId = req.user.id;

        // Check if user has ANY review (one review total per user)
        const review = await Review.findOne({ userId });
        return res.status(200).json({
            hasReviewed: !!review,
            review: review ? {
                collegeName: review.collegeName,
                collegeId: review.collegeId,
                rating: review.rating,
                comment: review.comment,
                createdAt: review.createdAt
            } : null
        });
    } catch (error) {
        console.log(`Error: ${error.message}`);
        return res.status(400).send({ message: 'Error checking review status' });
    }
};
