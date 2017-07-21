var express = require('express');
var router = express.Router();

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var Employer = require('../models/employer');
var Student = require('../models/student');
var Job = require('../models/job');

var async = require('async');
var searchPagedb_controller =  require('../controllers/searchPagedbController');


router.get('/', function(req,res,next){
	if(req.session.user){
		var store_User = req.session.user;
		async.parallel({
		        jobFunc: function(callback){
		            Job.find()
		                .populate('Search_page')
		                .exec(callback);
		        },
		        studentFunc: function(callback){
		            Student.findById(req.session.user._id)
		            		.exec(callback);
		        }
		    },function(err, results) {
		      if (err) { return next(err); }
		      res.render('./Search_page', {title: 'Search Page', job_list: results.jobFunc, student: results.studentFunc, store_User: 'session alive'});
			})
	}
	else if(req.session.emp){
		console.log(req.session.emp)
		var store_Emp = req.session.emp;
		async.parallel({
		        jobFunc: function(callback){
		            Job.find()
		                .populate('Search_page')
		                .exec(callback);
		        },
		        employerFunc: function(callback){
		            Employer.findById(req.session.emp._id)
		            		.exec(callback);
		        }
		    },function(err, results) {
		      if (err) { return next(err); }
		      res.render('./Search_page', {title: 'Search Page', job_list: results.jobFunc, employer: results.employerFunc, store_Emp: 'session alive'});
			})		
	}
	else{
		async.parallel({
			        jobFunc: function(callback){
			            Job.find()
			                .populate('Search_page')
			                .exec(callback);
			        }
			    },function(err, results) {
			      if (err) { return next(err); }
			      res.render('./Search_page', {title: 'Search Page', job_list: results.jobFunc});
		})
	}
});

/* POST request for search bar*/
router.post('/search', searchPagedb_controller.search);

module.exports = router;