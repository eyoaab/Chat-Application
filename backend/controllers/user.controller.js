const User = require('../models/user'); 
const jwt = require('jsonwebtoken'); 

exports.signup = async (req, res) => {
    try {
        const { name, username, password} = req.body;

        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ error: 'Username already exists.' });
        }

        const user = new User({
            name,
            username,
            password,
        });

        await user.save();

        res.status(201).json({
            message: 'User created successfully.',
            user: { name: user.name, username: user.username }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Password is not correct please try another' });
        }

        const token = jwt.sign({ userId: user._id}, process.env.JWT_SECRET, { expiresIn: '1h' });

        user.isOnline = true;
        await user.save();

        res.status(200).json({
            message: 'Login successful.',
            token, 
            user: { name: user.name, username: user.username, profilePicture: user.profilePicture, isOnline: user.isOnline }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.logout = async (req, res) => {
    try {
        const { userId } = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        user.isOnline = false;
        await user.save();

        res.status(200).json({ message: 'User logged out successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        // Find user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateUserProfile = async (req, res) => {
    try {
        const {loginUser} = req.user.id;
        const { userId } = req.params.id;
        const { name, bio, profilePicture } = req.body;

        // Find user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        if (String(loginUser)!== String(userId)) {
            return res.status(403).json({ error: 'You can only update your own profile.' });
        }

        // Update user details
        user.name = name || user.name;
        user.bio = bio || user.bio;
        user.profilePicture = profilePicture || user.profilePicture;

        await user.save();

        res.status(200).json({
            message: 'User profile updated successfully.',
            user: { name: user.name, bio: user.bio, profilePicture: user.profilePicture }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete user

exports.deleteUser = async (req, res) => {
    try {
        const {loginUser} = req.user.id;
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        if (String(user._id)!== String(loginUser)) {
            return res.status(403).json({ error: 'You can only delete your own account.' });
        }

        await Message.deleteMany({ sender: userId });

        await Chat.updateMany(
            { participants: userId },
            { $pull: { participants: userId } }
        );
        await Message.updateMany(
            { seenBy: userId },
            { $pull: { seenBy: userId } }
        );

        await user.deleteOne();

        res.status(200).json({ message: 'User and their associated messages deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};