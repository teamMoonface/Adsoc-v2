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
	else {
		var store_Emp = req.session.emp;
		console.log(store_Emp);
		Employer.findById(store_Emp._id)
			.exec(function(err, employerInstance) {
				if (err) { return next(err); }
				// successful, so render
				res.render('./Employer_profile', {title: 'Profile', employer: employerInstance, store_Emp: 'session alive'});
			})
	}
};

exports.profile_post = function(req,res,next) {

	req.checkBody('company_name', 'Company name is required').notEmpty();

		// run validators
	var errors = req.validationErrors();
	
	// create a student object
	
	if (errors) {
		//show 'unable to update message'
		console.log(errors);
		res.render('./Employer_profile', {
			errors: errors
		});        
	}
	else {
		Employer.findOne({_id: req.session.emp._id}, function(err, foundObject){
			if(req.body.company_name)
				foundObject.name = req.body.company_name;
			if(req.body.aboutme)
				foundObject.aboutme = req.body.aboutme;
			foundObject.save(function(err,updatedObject) {
				if(err) {
					console.log(err);
					res.status(500).send();
				} else {     
					console.log(req.files);        
                    req.flash('status', 'Your profile has been successfully updated!'); 
                    res.render('./Employer_profile',{ employer: foundObject, status: "profileUpdated", picture_id: {name: [req.files.filename]} });
				}
			});
		})
	};
		

};

exports.postjob_get = function(req, res, next) {
	if(!req.session.emp) {
		res.redirect('/employer/login');
	}
	else {
		var store_Emp = req.session.emp;
		console.log(req.session.emp);
		Employer.findById(store_Emp._id)
			.exec(function(err, employerInstance) {
				if (err) { return next(err); }
				res.render('./Employer_profile_post', { title: 'Post a Job', employer: employerInstance, store_Emp: 'session alive'})
		})
	}
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
	var store_Emp = req.session.emp;

	var job = new Job({
		name: req.body.name,
		desc: req.body.desc,
		startDate: req.body.startDate,
		endDate: req.body.endDate,
		remun: req.body.remun,
		skill_type: req.body.skill_type,
		employer: store_Emp._id,
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
		Employer.findByIdAndUpdate(store_Emp._id, {$push: {postedJobs: job}}, function(err) {
			console.log(err);
		});
	}
};

// Display employers' list of posted jobs
exports.postedjobsList = function(req, res, next) {
	if(!req.session.emp) {
		res.redirect('/employer/login');
	}
	else {
		var store_Emp = req.session.emp;
		async.parallel({
			jobFunc: function(callback){
				Job.find({'employer': store_Emp._id})
					.populate('./Employer_profile_post')
					.exec(callback);
			},
			employFunc: function(callback){
				Employer.findById(store_Emp._id)
					.exec(callback);
			}
		},function(err, results) {
		  if (err) { return next(err); }
		  res.render('./Employer_profile_posted', {title: 'Posted Jobs', postedJobs: results.jobFunc, employer: results.employFunc, numApplicants: results.applicantsCount, store_Emp: 'session alive'});
		});
	}
};

// View applicants for a job posting
exports.view_job_applicants = function(req, res,next) {
	if(!req.session.emp) {
		res.redirect('/employer/login');
	}
	else {
		var store_Emp = req.session.emp;
		async.parallel({
			jobFunc: function(callback){
				Job.findById(req.params.id)
					.populate('applicants')
					.exec(callback);
			},
			employFunc: function(callback){
				Employer.findByIdAndUpdate(store_Emp._id)
					.exec(callback);
			}
		},function(err, results) {
		  if (err) { return next(err); }
		  console.log(results.employFunc.name);
		  res.render('./Employer_profile_view_applicants', {title: 'Job Applicants', job: results.jobFunc, employer: results.employFunc, store_Emp: 'session alive'});
		});
	}
};

// Display Specific posted job
exports.job_detail = function(req, res, next) {  
	if(req.session.emp){
	  async.parallel({
		job: function(callback) {     
		  Job.findById(req.params.id)
			.exec(callback);
		},
		employer: function(callback) {
		  Employer.findById({ '_id': req.session.emp._id})
			.exec(callback);
		},
		employer_poster: function(callback) {
		  Employer.findOne({ 'postedJobs': req.params.id})
			.exec(callback);
		},
	  }, function(err, results) {
		if (err) { return next(err); }
		//Successful, so render
		var store_Emp = req.session.emp;
		res.render('./Job_view', { title: 'Job details', job: results.job, employer_poster: results.employer_poster, employer: results.employer, store_Emp: 'session alive' });
	  });
	}
	
	else {
		async.parallel({
            job: function(callback) {     
                Job.findById(req.params.id)
                    .exec(callback);
            },
            employer_poster: function(callback) {
                Employer.findOne({ 'postedJobs': req.params.id})
                    .exec(callback);
            },
            student: function(callback) {
                if (req.session.user) {
                    var store = req.session.user;
                    Student.findById({'_id': req.session.user._id})
                        .exec(callback);
                }
                else {
                    Student.findById(null)
                            .exec(callback);
                }
            }
		}, function(err, results) {
			if (err) { return next(err); }
			
            console.log('out else');
            console.log('STUDENT: ' + results.student);
            
            // student session
            if (req.session.user) {
                /* have already applied to job */
                if (results.job.applicants.indexOf(req.session.user._id) > -1) {
                    console.log('job status: applied')
                    /* favourited job */
                    if (results.student.favouriteJobs.indexOf(req.params.id) > -1) {
                        console.log('fav: true');
                        res.render('./Job_view', {job: results.job, employer_poster: results.employer_poster, employer: null, status: 'applied', fav: true, store_User: 'session alive'});
                    }
                    /* have not fav job */
                    else {
                        console.log('fav: false');
                        res.render('./Job_view', {job: results.job, employer_poster: results.employer_poster, employer: null, status: 'applied', fav: false, store_User: 'session alive'});
                    }
                }
                else {
                    /* have not applied to job*/
                    console.log('job status: not applied')
                    /* favourited job */
                    if (results.student.favouriteJobs.indexOf(req.params.id) > -1) {
                        console.log('fav: true');
                        res.render('./Job_view', {job: results.job, employer_poster: results.employer_poster, employer: null, status: 'notApplied', fav: true, store_User: 'session alive'});
                    }
                    /* have not fav job */
                    else {
                        console.log('fav: false');
                        res.render('./Job_view', {job: results.job, employer_poster: results.employer_poster, employer: null, status: 'notApplied', fav: false, store_User: 'session alive'});
                    }
                }
            }
            else {
                console.log('not logged in');
                console.log(results.employer_poster);
                res.render('./Job_view', {job: results.job, employer_poster: results.employer_poster, employer: null, status: 'notApplied', fav: false, store_Emp: 'session alive'});
            }
		});
	}
};

exports.apply_job = function(req, res, next) {
	if(!req.session.user) {
		res.redirect('/student/login');
	}
	else {
		var store_User = req.session.user;
		async.parallel({
			student: function(callback) {
				Student.findByIdAndUpdate(store_User._id, {$push: {appliedJobs: req.params.id}})
					   .exec(callback);
			},
			job: function(callback) {     
				Job.findByIdAndUpdate(req.params.id, {$push: {applicants: store_User._id}})
					.exec(callback);
			},
			employer_poster: function(callback) {
				Employer.findOne({ 'postedJobs': req.params.id})
					.exec(callback);
			}
		}, function(err, results) {
			if (err) { return next(err); }
			console.log('job status: apply success');
			res.render('./job_view', {job: results.job, employer_poster: results.employer_poster, status: 'applySuccess', store_User: 'session alive'});
		}); 
	}    
};

exports.delete_job = function(req, res, next) {
	if(!req.session.user) {
		res.redirect('/student/login')
	}
	else {
		var store_User = req.session.user;
        async.parallel({
            student: function(callback) {
                Student.findByIdAndUpdate(store_User._id, {$pull: {appliedJobs: req.params.id}})
                    .exec(callback);
            },
            job: function(callback) {
                Job.findByIdAndUpdate(req.params.id, {$pull: {applicants: store_User._id}})
                    .exec(callback);
            },
            employer_poster: function(callback) {
                Employer.findOne({'postedJobs': req.params.id})
                    .exec(callback);
            }
        }, function(err, results) {
            if(err) { return next(err); }
            console.log('deleting job application');
            /* favourited job */
            if (results.student.favouriteJobs.indexOf(req.params.id) > -1) {
                console.log('fav: true');
                res.render('./Job_view', {job: results.job, employer_poster: results.employer_poster, status: 'deleteSuccess', fav: true, store_User: 'session alive'});
            }
            /* have not fav job */
            else {
                console.log('fav: false');
                res.render('./Job_view', {job: results.job, employer_poster: results.employer_poster, status: 'deleteSuccess', fav: false, store_User: 'session alive'});
            }          
        });
	}
};

exports.favourite_job = function(req, res, next) {
    if (!req.session.user) {
        res.redirect('/student/login')
    }
    else {
        var store_User = req.session.user;
        async.parallel({
            student: function(callback) {
                Student.findByIdAndUpdate(store_User._id, {$push: {favouriteJobs: req.params.id}})
                    .exec(callback);
            },
            job: function(callback) {
                Job.findById(req.params.id)
                    .exec(callback);
            },
            employer_poster: function(callback) {
                Employer.findOne({'postedJobs': req.params.id})
                    .exec(callback);
            }
        }, function(err, results) {
            if (err) { return next(err); }
            console.log('favouriting job')
            res.render('./job_view', {job: results.job, employer_poster: results.employer_poster, status: 'notApplied', fav: true, store_User: 'session alive'});
        })
    }
};

exports.remove_fav = function(req, res, next) {
    if (!req.session.user) {
        res.redirect('/student/login')
    }
    else {
        var store_User = req.session.user;
        async.parallel({
            student: function(callback) {
                Student.findByIdAndUpdate(store_User._id, {$pull: {favouriteJobs: req.params.id}})
                    .exec(callback);
            },
            job: function(callback) {
                Job.findById(req.params.id)
                    .exec(callback);
            },
            employer_poster: function(callback) {
                Employer.findOne({'postedJobs': req.params.id})
                    .exec(callback);
            }
        }, function(err, results) {
            if (err) { return next(err); }
            console.log('removing job from fav')
            res.render('./job_view', {job: results.job, employer_poster: results.employer_poster, status: 'notApplied', fav: false, store_User: 'session alive'});
        })
    }
}

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
	var phoneNum = req.body.phonenum;

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
		'phoneNum': {
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
			phoneNum: req.body.phoneNum,
			email: req.body.email,
			aboutme: '',
		});

		Employer.createEmployer(newEmployer, function(err,user) {
			if (err) throw err;
			console.log(user);
		}) 

		
		req.flash('status', 'Thank you for registering with Adsoc, you may now login');

		res.redirect('/login_employer');
	}
}