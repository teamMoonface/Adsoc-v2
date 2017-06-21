var express = require('express');
var router = express.Router();

router.get('/student', function(req, res, next) {
    res.render('signup_student');
});

router.get('/employer', function(req, res, next) {
    res.render('signup_employer');
});

module.exports = router;