var Employer = require('../models/employer');
var Job = require('../models/job');
var async = require('async');


exports.profile_get = function(req, res, next) {
    
    Employer.findById(req.params.id)
        .exec(function(err, employerInstance) {
            if (err) { return next(err); }
            // successful, so render
             res.render('employerProfile', {title: 'Profile', employer: employerInstance});
        })
}

exports.postjob_get = function(req, res, next) {
    
    Employer.findById(req.params.id)
        .exec(function(err, employerInstance) {
            if (err) { return next(err); }
            res.render('postjob', { title: 'Post a Job', employer: employerInstance})
    })
}

exports.postjob_post = function(req, res, next) {
    
    req.checkBody('name', 'Job name required').notEmpty();
    req.checkBody('desc', 'Job description required').notEmpty();
    req.checkBody('startDate', 'Starting date requried').notEmpty();
    req.checkBody('endDate', 'Ending date required').notEmpty();
    req.checkBody('remun', 'Remuneration required').notEmpty();
    
    req.checkBody({
        'desc': {
            optional: {
                options: { checkFalsy: true}
            },
            isLength: {
                options: [{max: 1000}],
                errorMessage: "Desc: max length of 1000 characters"
            }
        },
        'endDate': {
            optional: {
                options: { checkFalsy: true}
            },
            isAfter: {
                options: [req.body.startDate],
                errorMessage: 'Ending job period must be after starting job period'
            }
        },
        'remun': {
            optional: {
                options: { checkFalsy: true}
            },
            isNumeric: {
                errorMessage: 'Invalid remuneration entered'
            }
        }
    });
    
    req.sanitize('name').escape();
    req.sanitize('name').trim();
    req.sanitize('desc').escape();
    req.sanitize('desc').trim();
    req.sanitize('remun').escape();
    req.sanitize('remun').trim();

    var errors = req.validationErrors();
    
    var job = new Job({
        name: req.body.name,
        desc: req.body.desc,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        remun: req.body.remun
    });
    
    if (errors) {
        res.render('postjob', {title: 'Post a Job', job: job});
        return;
    }
    else {
        job.save(function(err) {
            if (err) { return next(err); }           
            res.render('postedjobs', {title: 'Posted Jobs'})
        });
    }
}