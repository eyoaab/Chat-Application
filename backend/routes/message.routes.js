const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');

const messageController = require('../controllers/message.controller');

router.post('/',authMiddleware,messageController.addMessageToChat);
router.put('',authMiddleware,messageController.updateMessage);
router.delete('',authMiddleware,messageController.deleteMessage)

module.exports = router;
