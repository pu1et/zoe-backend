const express = require('express');

const userController = require('../controllers/user');
const isAuth = require("../middleware/is-auth");

const router = express.Router();

/* sns 로그인 */
router.post('/kakao', userController.kakaoLogin);
router.post('/naver', userController.naverLogin);
router.post('/apple', userController.appleLogin);

router.patch('/nickname', isAuth, userController.updateNickname);

router.delete('', isAuth, userController.deleteUser);
module.exports = router;
