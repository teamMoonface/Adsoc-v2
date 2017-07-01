var Student = require('../models/student');
var async = require('async');


exports.profile_get = function(req, res, next) {
    
    Student.findById(req.params.id)
        .exec(function(err, studentInstance) {
            if (err) { return next(err); }
            // successful, so render
             res.render('studentProfile', {title: 'Profile', student: studentInstance});
        })
};

//Open Student profile - open for everyone to view
exports.open_profile_get = function(req, res, next) {
    Student.findById(req.params.id)
        .exec(function(err, studentInstance) {
            if (err) { return next(err); }
            // successful, so render
             res.render('profile_view', {title: 'Profile', student: studentInstance});
        })
};

exports.favourites_get = function(req, res, next) {
    
    Student.findById(req.params.id)
        .exec(function(err, studentInstance) {
            if (err) { return next(err); }
            // successful, so render
             res.render('favourites', {title: 'Favourites', student: studentInstance});
        })
};

exports.applied_jobs_get = function(req, res, next) {
    
    Student.findById(req.params.id)
        .exec(function(err, studentInstance) {
            if (err) { return next(err); }
            // successful, so render
             res.render('appliedjobs', {title: 'Applied Jobs', student: studentInstance});
        })
};