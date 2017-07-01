var Employer = require('../models/employer');
var Student = require('../models/student');
var Job = require('../models/job');

var async = require('async');

//List of all jobs
exports.job_list = function(req, res, next) {
  Job.find()
    .populate('searchPage')
    .exec(function (err, joblist) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('searchPage', { title: 'Brwose Jobs', job_list: joblist });
    });
};