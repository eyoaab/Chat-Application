const Message = require('../models/message');  
const User = require('../models/user'); 

// Update message by sender
exports.updateMessage = async (req, res) => {
    try {
        const { text, imageUrl, messageId} = req.body;  
        const { userId } = req.user.id; 

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ error: 'Message not found.' });
        }

        if (String(message.sender) !== String(userId)) {
            return res.status(403).json({ error: 'You can only update your own messages.' });
        }

        message.text = text || message.text;
        message.imageUrl = imageUrl || message.imageUrl;

        const updatedMessage = await message.save();

        res.status(200).json(updatedMessage);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.body;  
        const { userId } = req.user.id;  

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ error: 'Message not found.' });
        }

        if (String(message.sender) !== String(userId) ) {
            return res.status(403).json({ error: 'You can only delete your own messages.' });
        }
        await Chat.updateMany(
            { messages: messageId },
            { $pull: { messages: messageId } }
        );

        await message.deleteOne();

        res.status(200).json({ message: 'Message deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Add a message to a chat

exports.addMessageToChat = async (req, res) => {
    try {
        const { text, imageUrl,chatId} = req.body;
        const { sender } = req.user.id;


        if ((!text && !imageUrl)) {
            return res.status(400).json({ error: 'Sender and either text or imageUrl are required.' });
        }

        const message = new Message({
            text,
            imageUrl,
            sender,
            chatId,
        });
        await message.save();

        const chat = await Chat.findByIdAndUpdate(
            chatId,
            { 
                $push: { messages: message._id },
                $set: { updatedAt: new Date() }, 
            },
            { new: true }
        )
            .populate('participants', '-password')
            .populate('admin', '-password')
            .populate({
                path: 'messages',
                options: { sort: { createdAt: -1 }, limit: 1 }, 
                populate: { path: 'sender', select: '-password' },
            });

        if (!chat) {
            return res.status(404).json({ error: 'Chat not found.' });
        }

        res.status(201).json({
            message: 'Message added successfully.',
            messageDetails: message,
            updatedChat: chat,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
