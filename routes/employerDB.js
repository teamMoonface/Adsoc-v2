var express = require('express');
var router = express.Router();

var employerDB_controller = require('../controllers/employerdbController');

router.get('/:id/profile', employerDB_controller.profile_get);

router.get('/postedjobs', function(req, res, next) {
    res.render('postedjobs');
})

router.get('/postjob', function(req, res, next) {
    res.render('postjob');
})

module.exports = router;