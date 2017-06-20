var express = require('express');
var router = express.Router();

router.get('/appliedjobs', function(req, res, next) {
  res.render('appliedjobs');
});

router.get('/favourites', function(req, res, next) {
    res.render('favourites');
})

router.get('/profile', function(req, res, next) {
    res.render('studentProfile');
})

module.exports = router;