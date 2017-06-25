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