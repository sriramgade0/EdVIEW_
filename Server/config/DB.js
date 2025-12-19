const mongoose = require('mongoose');
require('dotenv').config();

const connectionString = process.env.MONGO_URI;
console.log(connectionString);
const connectMongoDB = async () => {
    try{
        await mongoose.connect(connectionString);
        console.log("Successfully Connected to MongoDB");

    }catch(error){
        console.log('Error connecting to MongoDB', error.message);
        process.exit(1);
    }
}

module.exports = connectMongoDB;