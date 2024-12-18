const express = require('express');
const router = express.Router();
const atuhMiddleware = require('../middlewares/auth.middleware');
const userController = require('../controllers/user.controller');

router.post('/login', userController.login);
router.post('/register', userController.signup);
router.post('/logout', userController.logout);

router.get('/',userController.getAllUsers);
router.get('/getProfile', atuhMiddleware, userController.getUserProfile);
router.put('/:id',atuhMiddleware,userController.updateUserProfile);
router.delete('/:id',atuhMiddleware,userController.deleteUser);

module.exports = router;
