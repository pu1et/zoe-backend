const express = require('express');

const upload = require('../middleware/upload');
const imageController = require('../controllers/image');

const router = express.Router();

/* 프로필 사진 업로드 */
router.post('/', upload.single('image'), imageController.postImage);

module.exports = router;