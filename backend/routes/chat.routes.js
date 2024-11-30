const express = require('express');
const authMidleware = require('../middlewares/auth.middleware');
const router = express.Router();

const chatController =  require('../controllers/chat.controller');

router.get('/usersChat', authMidleware,chatController.getChatMessages);
router.get('/',chatController.getChatById);

router.post('/',authMidleware,chatController.createChat);

router.put('/addParticipants',chatController.addParticipants);
router.put('/removeParticipants',chatController.removeParticipants);
router.put('/addOurself',chatController.addOurself);
router.put('/',authMidleware,chatController.updateGroupChat);

router.delete('/',authMidleware,chatController.deleteChat);
router.delete('/removeOurself',authMidleware,chatController.removeOurselfFromTheChat);

module.exports = router;
