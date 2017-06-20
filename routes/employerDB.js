var express = require('express');
var router = express.Router();

router.get('/profile', function(req, res, next) {
  res.render('employerProfile');
});

router.get('/postedjobs', function(req, res, next) {
    res.render('postedjobs');
})

router.get('/postjob', function(req, res, next) {
    res.render('postjob');
})

module.exports = router;