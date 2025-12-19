const mongoose = require ('mongoose');


const userSchema = new mongoose.Schema({
    email : {
        type : String,
        require: [true , 'Your Email is required']
    },
    username : {
        type : String,
        require : [true , 'Your Username is required']
    },
    password : {
        type : String,
        require : [true , 'Your Password is required']
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String,
        default: null
    },
    verificationTokenExpires: {
        type: Date,
        default: null
    },
    createdAt : {
        type : Date,
        default : new Date()
    }
})

module.exports = mongoose.model("user",userSchema)