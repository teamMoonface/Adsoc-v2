var express = require('express');
var router = express.Router();

router.get('/student_login', function(req, res, next) {
  res.render('student_login');
});

router.get('/employer_login', function(req, res, next) {
  res.render('employer_login');
});


module.exports = router;