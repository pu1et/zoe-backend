const express = require('express');

const gamerController = require('../controllers/gamer');
const isAuth = require('../middleware/is-auth');
const updateGamer = require('../middleware/update-gamer');

const router = express.Router();

// GET /gamer
router.get('/', isAuth, updateGamer, gamerController.getGamerInfo);

// PUT /gamer
router.put( '/', isAuth, gamerController.updateGamerInfo);

// POST /gamer/postPickItem
router.post( '/postPickItem', isAuth, gamerController.postPickItem);

// POST /gamer/postUseItem
router.post( '/postUseItem', isAuth, gamerController.postUseItem);

module.exports = router;
