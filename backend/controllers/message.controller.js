const Message = require('../models/message');  
const User = require('../models/user'); 

// Update message by sender
exports.updateMessage = async (req, res) => {
    try {
        const { messageId } = req.params;  
        const { text, imageUrl } = req.body;  
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
        const { messageId } = req.params;  
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
