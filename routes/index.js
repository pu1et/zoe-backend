const express = require('express');

const router = express.Router();

router.get('/privacy-policy',function(req, res) {
    res.render('index', { title:'Express' });
});

module.exports = router;
