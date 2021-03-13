const express = require('express');

const userController = require('../controllers/user');
const {
    postSignupValidator,
    postLoginValidator,
} = require('../middleware/validator');

const router = express.Router();

router.post('/signup', postSignupValidator, userController.postSignup);
router.post('/login', postLoginValidator, userController.postLogin);

/* sns 로그인 */
router.post('/kakao', userController.postKakaoLogin);
router.post('/facebook', userController.postFacebookLogin);

router.delete('/facebook/:facebookId', userController.deleteFacebookId);

module.exports = router;
