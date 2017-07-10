var Student = require('../models/student');
var Employer = require('../models/employer');
var Job = require('../models/job');
var async = require('async');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


exports.profile_get = function(req, res, next) {
    if(!req.session.emp) {
        res.redirect('/employer/login');
    }
    var store = req.session.emp;
    console.log(store);
    Employer.findById(store._id)
        .exec(function(err, employerInstance) {
            if (err) { return next(err); }
            // successful, so render
            res.render('./Employer_profile', {title: 'Profile', employer: employerInstance});
        })
};

exports.postjob_get = function(req, res, next) {
    if(!req.session.emp) {
        res.redirect('/employer/login');
    }
    var store = req.session.emp;
    Employer.findById(store._id)
        .exec(function(err, employerInstance) {
            if (err) { return next(err); }
            res.render('./Employer_profile_post', { title: 'Post a Job', employer: employerInstance})
    })
};

exports.postjob_post = function(req, res, next) {
    
    req.checkBody('name', 'Job name required').notEmpty();
    req.checkBody('desc', 'Job description required').notEmpty();
    req.checkBody('startDate', 'Starting date requried').notEmpty();
    req.checkBody('endDate', 'Ending date required').notEmpty();
    req.checkBody('remun', 'Remuneration required').notEmpty();
    req.checkBody('skill_type', 'Skill type required').notEmpty();
    
    req.checkBody({
        'desc': {
            optional: {
                options: { checkFalsy: true}
            },
            isLength: {
                options: [{max: 1000}],
                errorMessage: 'Desc: max length of 1000 characters'
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
            isFloat: {
                options: [{min: 0}],
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
    req.sanitize('remun1').escape();
    req.sanitize('remun1').trim();

    var errors = req.validationErrors();
    
    var job = new Job({
        name: req.body.name,
        desc: req.body.desc,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        remun: req.body.remun,
        skill_type: req.body.skill_type,
        employer: req.params.id,
    });

    
    if (errors) {
        res.render('./Employer_profile_post', {title: 'Post a Job', job: job, errors: errors});
        return;
    }
    else {
        job.save(function(err) {
            if (err) { return next(err); }           
            res.redirect(job.url)
        });
        
        // add to employer's posted jobs
        Employer.findByIdAndUpdate(req.params.id, {$push: {postedJobs: job}}, function(err) {
            console.log(err);
        });
    }
};

// Display employers' list of posted jobs
exports.postedjobsList = function(req, res, next) {
    if(!req.session.emp) {
        res.redirect('/employer/login');
    }
    var store = req.session.emp;
    async.parallel({
        jobFunc: function(callback){
            Job.find({'employer': store._id})
                .populate('./Employer_profile_post')
                .exec(callback);
        },
        employFunc: function(callback){
            Employer.findById(store._id)
                .exec(callback);
        }
    },function(err, results) {
      if (err) { return next(err); }
      res.render('./Employer_profile_posted', {title: 'Posted Jobs', postedJobs: results.jobFunc, employer: results.employFunc, numApplicants: results.applicantsCount});
    });
};

// View applicants for a job posting
exports.view_job_applicants = function(req, res,next) {
    if(!req.session.emp) {
        res.redirect('/employer/login');
    }
    var store = req.session.emp;
    async.parallel({
        students: function(callback) {
            Student.find({'appliedJobs': store._id})
                    .exec(callback);
        },
        job: function(callback) {
            Job.findById(store._id)
                .exec(callback);
        }
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('./Employer_profile_view_applicants', {title: 'View Applicants for ', students: results.students, job: results.job});
    });
};

// Display Specific posted job
exports.job_detail = function(req, res, next) {   
  async.parallel({
    job: function(callback) {     
      Job.findById(req.params.id)
        .exec(callback);
    },
    employer: function(callback) {
      Employer.findOne({ 'postedJobs': req.params.id})
        .exec(callback);
    },
  }, function(err, results) {
    if (err) { return next(err); }
    //Successful, so render
    res.render('./Job_view', { title: 'Job details', job: results.job, employer: results.employer });
  });
};

//=========================================================DIVDER=========================================================
//=========================================================DIVDER=========================================================
//=========================================================DIVDER=========================================================
//=========================================================DIVDER=========================================================

// Display list of all Employers
exports.employer_list = function(req, res, next) {

  Employer.find()
    .sort([['name', 'ascending']])
    .exec(function (err, list_employers) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('./A-Employer_list', { title: 'Employer List', employer_list: list_employers });
    });

};

exports.signup_employer_create_get = function(req, res, next) {
    res.render('./Sign_up_employer', {title: 'Employer Sign-Up'});
};

exports.signup_employer_create_post = function(req, res, next) {
    
    var username =req.body.username;
    var password = req.body.password;
    var name= req.body.name;
    var email= req.body.email;
    var phonenum = req.body.phonenum;

    // check for validity
    req.checkBody('name', 'Company/Project name required').notEmpty();
    req.checkBody('email', 'Email required').isEmail();
    req.checkBody('username', 'Username required').notEmpty();
    req.checkBody('password', 'Password required').notEmpty();
    
    // check only when field is not empty
    req.checkBody({
        'email': {
            optional: {
                options: { checkFalsy: true}
            },
            isEmail: {
                errorMessage: "Invalid email address"
            },
        },
        'phonenum': {
            optional: {
                options: { checkFalsy: true}
            },
            isNumeric: {
                errorMessage: "Invalid phone number"
            }
        },
        'username': {
            optional: {
                options: { checkFalsy: true}
            },
            isLength: {
                options: [{min: 5, max: 15}],
                errorMessage: "Username: min 5 characters, max 15 characters"
            }
        },
        'password': {
            optional: {
                options: { checkFalsy: true}
            },
            isLength: {
                options: [{min: 6}],
                errorMessage: "Password: min 6 characters" 
            }
        }
    });
    
    // run validators
    var errors = req.validationErrors();
    
    
    if (errors) {
        res.render('./Sign_up_employer', {
            errors: errors
        });
    }
    else {

        // create an employer object
        var newEmployer = new Employer({
            username: req.body.username,
            password: req.body.password,
            name: req.body.name,
            phonenum: req.body.phonenum,
            email: req.body.email,
        });

        Employer.createEmployer(newEmployer, function(err,user) {
            if (err) throw err;
            console.log(user);
        }) 

        
        req.flash('success_msg', 'Thank you for registering with Adsoc, you may now login');

        res.redirect('/employer/login');
    }
}