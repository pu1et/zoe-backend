const express = require('express');
const { body } = require('express-validator');

const MindcloudController = require('../controllers/mindcloud');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// GET /mindcloud/:start-date/:end-date
router.get('/:startDate/:endDate', isAuth, MindcloudController.getMindcloud);

module.exports = router;



