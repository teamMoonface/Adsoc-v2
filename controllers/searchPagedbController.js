var Employer = require('../models/employer');
var Student = require('../models/student');
var Job = require('../models/job');
var async = require('async');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var async = require('async');

//List of all jobs
exports.job_list = function(req, res, next) {

    async.parallel({
        jobFunc: function(callback){
            Job.find()
                .populate('Search_page')
                .exec(callback);
        },
        studentFunc: function(callback){
            if(!req.session.user){
            	res.redirect('/student/login')
            }
            console.log(req.session.user._id);
            Student.findById(req.session.user._id)
            		.exec(callback);
        }
    },function(err, results) {
      if (err) { return next(err); }
      res.render('./Search_page', {title: 'Search Page', job_list: results.jobFunc, student: results.studentFunc});
	});
};