const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    isGroup: { type: Boolean, default: false },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    groupProfilePicture: { type: String, default: '' }, 
    groupName: { type: String, default: '' }, 
    groupDescription: { type: String, default: '' },
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }], 
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
