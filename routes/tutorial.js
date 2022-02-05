const express = require('express');
const { body } = require('express-validator');

const tutorialController = require('../controllers/tutorial');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// GET /tutorial/list/:listId
router.get('/list/:listId', isAuth, tutorialController.getTutorialList);

// GET /tutorial/:tutorialId
router.get('/:tutorialId', isAuth, tutorialController.getTutorial);

// GET /tutorial/comments/:tutorialId
router.get('/comments/:tutorialId', isAuth, tutorialController.getComments);
router.delete('/:tutorialId/comments/:commentId', tutorialController.deleteComment);

// POST /tutorial
router.post(
  '/',
  tutorialController.createTutorial
);

// POST /tutorial/comment/:tutorialId
router.post(
    '/comment/:tutorialId',
    isAuth,
    tutorialController.postComment
);

// GET /tutorial/is-favorite/:tutorialId
router.get('/is-favorite/:tutorialId', isAuth, tutorialController.getIsFavorite);

// POST /tutorial/add-favorite/:tutorialId
router.post(
    '/add-favorite/:tutorialId',
    isAuth,
    tutorialController.postAddFavorite
);

// POST /tutorial/remove-favorite/:tutorialId
router.post(
    '/remove-favorite/:tutorialId',
    isAuth,
    tutorialController.postRemoveFavorite
);

module.exports = router;
