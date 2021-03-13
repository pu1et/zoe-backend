const express = require('express');
const { body } = require('express-validator');

const storyController = require('../controllers/story');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// GET /story
router.get('/', isAuth, storyController.getStories);

// POST /story
router.post(
  '/',
  isAuth,
  storyController.createStory
);

// PUT /story/:storyId
router.put(
    '/:storyId',
    isAuth,
    [
        body('content')
        .trim()
        .isLength({ min: 5 })
    ],
    storyController.updateStory
);

// DELETE /story/:storyId
router.delete('/:storyId', isAuth, storyController.deleteStory);

// GET /story/stories-date
router.get('/stories-date', isAuth, storyController.getStoriesDate);

/**
 * 레거시 -> 얘를 버리고 날짜 검색같은걸 추가해야함 .
 */
// GET /story/:storyId
router.get('/:storyId', isAuth, storyController.getStory);

module.exports = router;



