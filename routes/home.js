var express = require('express');
var router = express.Router();
var Student = require('../models/student');

router.get('/', function(req, res, next) {	
	if(req.session.user){
		Student.findById(req.session.user._id)
	        .exec(function(err, studentInstance) {
	        	if (err) { return next(err); }
	            return  res.render('./home', {title: 'home', student: studentInstance});
	        })}
	 else
	 	res.render('./home')
});

module.exports = router;