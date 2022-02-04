const express = require('express');

const authController = require('../controllers/auth');
const {
    postSendTokenValidator,
    postVerifyTokenValidator,
    postResetPasswordValidator,
    getCheckIdValidator,
    getCheckEmailValidator,
    getCheckNicknameValidator,
} = require('../middleware/validator');

const router = express.Router();

router.post('/send-token', postSendTokenValidator, authController.postSendToken);
router.post('/verify-token', postVerifyTokenValidator, authController.postVerifyToken);
router.post('/reset-password', postResetPasswordValidator, authController.postResetPassword);

router.get('/send-link', authController.getSendLink);
router.get('/verify-link', authController.getVerifyLink);
router.get('/check-id/:id', getCheckIdValidator, authController.getCheckId);
router.get('/check-email/:email', getCheckEmailValidator, authController.getCheckEmail);
router.get('/check-nickname/:nickname', getCheckNicknameValidator, authController.getCheckNickname);
router.get('/is-verified', authController.getIsEmailVerified);

module.exports = router;
