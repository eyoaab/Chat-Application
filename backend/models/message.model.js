const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  text: { type: String, default: '' },
  imageUrl: { type: String, default: '' }, 
  seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
