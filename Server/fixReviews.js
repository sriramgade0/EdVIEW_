const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection string
const mongoURI = 'mongodb://0.0.0.0:27017/EdView';

async function fixReviewsCollection() {
    try {
        // Connect to MongoDB
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        // Get the database
        const db = mongoose.connection.db;

        // Drop the reviews collection to remove old indexes
        try {
            await db.collection('reviews').drop();
            console.log('✓ Dropped old reviews collection');
        } catch (error) {
            if (error.code === 26) {
                console.log('Reviews collection does not exist (this is okay)');
            } else {
                throw error;
            }
        }

        console.log('✓ Reviews collection has been reset');
        console.log('✓ The server will create it with the correct schema on next use');

        // Close connection
        await mongoose.connection.close();
        console.log('✓ Connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing reviews collection:', error);
        process.exit(1);
    }
}

fixReviewsCollection();
