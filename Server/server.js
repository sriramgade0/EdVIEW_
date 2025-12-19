const express = require('express');
const connectMongoDB = require("./config/DB");
const EdviewRoutes = require('./routes/edview');
const authRoutes = require('./routes/auth');
const reviewRoutes = require('./routes/review');
const cors = require('cors'); // Import CORS
require('dotenv').config();

const app = express();
app.use(cors({
    origin: 'http://localhost:3000', // Allow requests only from this origin
    methods: ['GET', 'POST', 'PATCH', 'DELETE'], // Specify allowed methods
    credentials: true, // Allow credentials if needed
}));
// Increase body size limit to handle base64 image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect to the database
connectMongoDB();

// Port
const PORT = process.env.PORT || 9000;

// Routes
app.use('/api/edview', EdviewRoutes);
app.use('/api', authRoutes);
app.use('/api/reviews', reviewRoutes);

app.listen(PORT, () => {
    console.log(`App server is listening on port ${PORT}`);
});
