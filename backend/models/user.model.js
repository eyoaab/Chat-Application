const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: {type:String , required: true},
    bio: { type: String, default: '' },
    profilePicture: { type: String, default: '' }, 
    isOnline: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);