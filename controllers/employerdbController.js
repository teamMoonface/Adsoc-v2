var Employer = require('../models/employer');
var async = require('async');


exports.profile_get = function(req, res, next) {
    
    Employer.findById(req.params.id)
        .exec(function(err, employerInstance) {
            if (err) { return next(err); }
            // successful, so render
             res.render('employerProfile', {title: 'Profile', employer: employerInstance});
        })
}