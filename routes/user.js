const express = require('express');

const userController = require('../controllers/user');

const router = express.Router();

/* sns 로그인 */
router.post('/kakao', userController.postKakaoLogin);

module.exports = router;
