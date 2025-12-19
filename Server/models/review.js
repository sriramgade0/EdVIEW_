const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    collegeId: {
        type: String,
        required: [true, 'College ID is required']
    },
    collegeName: {
        type: String,
        required: [true, 'College name is required']
    },
    reviewer: {
        type: String,
        required: [true, 'Reviewer name is required']
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'User ID is required']
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: [true, 'Comment is required']
    },
    images: {
        type: [String],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient queries
reviewSchema.index({ collegeId: 1, createdAt: -1 });

// Unique index to prevent multiple reviews per user (one review total per user)
reviewSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
