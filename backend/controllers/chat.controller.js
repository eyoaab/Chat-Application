const Chat = require('../models/chat.model');
const Message = require('../models/message.model');

// Create a new chat
exports.createChat = async (req, res) => {
    try {
        const { isGroup, participants, groupName, groupProfilePicture, groupDescription } = req.body;
        const admin = req.user.userId;

        const chat = new Chat({
            isGroup,
            participants,
            admin: isGroup ? admin : null,
            groupName: isGroup ? groupName : '',
            groupProfilePicture: isGroup ? groupProfilePicture : '',
            groupDescription: isGroup ? groupDescription : '',
        });

        const savedChat = await chat.save();
        res.status(201).json(savedChat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Get chat by ID
exports.getChatById = async (req, res) => {
    try {
        const { chatId } = req.body;

        const chat = await Chat.findById(chatId)
            .populate('participants', '-password')
            .populate('admin', '-password')
            .populate({
                path: 'messages',
                options: {
                    sort: { createdAt: -1 },
                },
                populate: { path: 'sender', select: '-password' },
            });

        if (!chat) {
            return res.status(404).json({ error: `Chat with ID ${chatId} not found.` });
        }

        res.status(200).json(chat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Get all chats for a user
exports.getUserChats = async (req, res) => {
    try {
        const userId = req.user.userId;

        const chats = await Chat.find({ participants: userId })
            .sort({ updatedAt: -1 })
            .populate('participants', '-password')
            .populate('admin', '-password')
            .populate({
                path: 'messages',
                options: { sort: { createdAt: -1 } },
                populate: { path: 'sender', select: '-password' },
            });

        if (!chats.length) {
            return res.status(404).json({ error: 'No chats found for this user.' });
        }

        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update group chat details
exports.updateGroupChat = async (req, res) => {
    try {
        const { groupName, groupProfilePicture, groupDescription,chatId } = req.body;
        const userId = req.user.userId;


        if (!groupName && !groupProfilePicture && !groupDescription) {
            return res.status(400).json({ error: 'No fields provided to update.' });
        }

        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ error: 'Chat not found.' });
        }

        if (!chat.isGroup) {
            return res.status(400).json({ error: 'The specified chat is not a group chat so you can not update it.' });
        }

        if (String(userId) !== String(chat.admin)) {
            return res.status(403).json({ error: 'Only the admin can update group details.' });
        }

        chat.groupName = groupName || chat.groupName;
        chat.groupProfilePicture = groupProfilePicture || chat.groupProfilePicture;
        chat.groupDescription = groupDescription || chat.groupDescription;

        const updatedChat = await chat.save();

        const populatedChat = await updatedChat.populate('participants', '-password')
            .populate('admin', '-password')
            .populate({
                path: 'messages',
                options: { sort: { createdAt: -1 } },
                populate: { path: 'sender', select: '-password' },
            });

        res.status(200).json({
            message: 'Group chat updated successfully.',
            updatedChat: populatedChat,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a chat
exports.deleteChat = async (req, res) => {
    try {
        const { chatId } = req.body;
        const userId = req.user.userId;


        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ error: 'Chat not found.' });
        }

        if (chat.isGroup) {
            if (String(userId) !== String(chat.admin)) {
                return res.status(403).json({ error: 'Only the admin can delete the group chat.' });
            }
        }

        await Message.deleteMany({ chatId });

        await chat.deleteOne();

        res.status(200).json({ message: 'Chat deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// add members to the group
exports.addParticipants = async (req, res) => {
    try {
        const { participantsToAdd,chatId} = req.body;

        const chat = await Chat.findById(chatId);
        if (!chat || !chat.isGroup) {
            return res.status(400).json({ error: 'Chat not found or is not a group chat.' });
        }

        if (participantsToAdd) {
            const newParticipants = participantsToAdd.filter((id) => !chat.participants.includes(id));
            chat.participants.push(...newParticipants);
        }

        const updatedChat = await chat.save();
        res.status(200).json(updatedChat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// remove members from the chat
exports.removeParticipants = async (req, res) => {
    try {
        const { participantsToRemove,chatId} = req.body;

        const chat = await Chat.findById(chatId);
        if (!chat || !chat.isGroup) {
            return res.status(400).json({ error: 'Chat not found or is not a group chat.' });
        }
        
        if (participantsToRemove) {
            chat.participants = chat.participants.filter(
                (id) => !participantsToRemove.includes(id.toString())
            );
        }

        const updatedChat = await chat.save();
        res.status(200).json(updatedChat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.removeOurselfFromTheChat = async (req, res) => {
    try {
        const { chatId } = req.body;
        const  userId  = req.user.userId;  


        const chat = await Chat.findById(chatId);
        if (!chat || !chat.isGroup) {
            return res.status(400).json({ error: 'Chat not found or is not a group chat.' });
        }

        if (!chat.participants.includes(userId)) {
            return res.status(404).json({ error: 'User is not a participant in this chat.' });
        }

        chat.participants = chat.participants.filter((id) => id.toString() !== userId.toString());

        if (chat.participants.length === 0) {
            await chat.deleteOne();  
            return res.status(200).json({ message: 'Chat deleted as there are no participants left.' });
        }

        const updatedChat = await chat.save();

        res.status(200).json(updatedChat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add our self to the group 
exports.addOurself = async (req, res) => {
    try {
        const { chatId } = req.body;
        const  userId  = req.user.userId;  

        const chat = await Chat.findById(chatId);
        
        if (!chat || !chat.isGroup) {
            return res.status(400).json({ error: 'Chat not found or is not a group chat.' });
        }

        if (chat.participants.includes(userId)) {
            return res.status(400).json({ error: 'You are already a member of the group.' });
        }

        chat.participants.push(userId);

        const updatedChat = await chat.save();

        res.status(200).json(updatedChat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
