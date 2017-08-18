var Student = require('../models/student');
var Employer = require('../models/employer');
var Job = require('../models/job');
var Image = require('../models/images');
  
var fs = require('fs');
var imgPath = '/public/uploads/hj.jpg';  

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
		async.parallel({
			employFunc: function(callback){
				Employer.findOne({_id: req.session.emp._id})
					.exec(callback);
			},
			ImageFunction: function(callback){
				Image.findOne({user_id: req.session.emp._id})
					.exec(callback);
			}
		}, function(err, results) {
			if(err) {
				console.log(err);
				throw err;
			} 
			res.render('./Employer_profile', {title: 'Profile', employer: results.employFunc, image: results.ImageFunction, store_Emp: 'session alive'});
		}); 
	}
};

exports.profile_post = function(req,res,next) {

	req.checkBody('company_name', 'Company name is required').notEmpty();
	if(req.file!= null)
        var file_name = req.file.filename;
    console.log(req.file);

	// run validators
	var err_update = req.validationErrors();

	// create a student object
	
	if (err_update) {
        async.parallel({
           ImageFunction: function(callback){
                Image.findOne({user_id: req.session.emp._id})
                    .exec(callback);
            },
            UpdateFunction: function(callback){
                Employer.findById(req.session.emp._id)
                    .exec(callback);
            } 
        }, function(err, results){
            if (err) { return next(err); }
            console.log(err_update);
            res.render('./Student_profile', { err_update: err_update, student: results.UpdateFunction, image: results.ImageFunction });        
        })      
	}
	else {
		var store_Emp = req.session.emp;

		async.parallel({
			ImageFunction: function(callback){
				Image.findOne({user_id: req.session.emp._id})
					.exec(callback);
			},
			UpdateFunction: function(callback){
				Employer.findById(req.session.emp._id)
					.exec(callback);
			}
		}, function(err, results) {
		  	if (err) { return next(err); }
		  	if(req.body.company_name)
				results.UpdateFunction.name = req.body.company_name;
			if(req.body.aboutme)
				results.UpdateFunction.aboutme = req.body.aboutme;
			if(req.file != null)
				results.ImageFunction.file_name = file_name;
			
			results.UpdateFunction.save();
			results.ImageFunction.save();
			console.log(results.UpdateFunction);

			//console.log(results.ImageFunction.user_id);
			req.flash('status', 'Your profile has been successfully updated!'); 
		  	res.render('./Employer_profile', {employer: results.UpdateFunction, image: results.ImageFunction, status: "profileUpdated", store_Emp:'session alive'});
		});
	}
};

exports.postjob_get = function(req, res, next) {
	if(!req.session.emp) {
		res.redirect('/employer/login');
	}
	else {
		var store_Emp = req.session.emp;
		console.log(req.session.emp);
		async.parallel({
			ImageFunction: function(callback){
				Image.findOne({user_id: req.session.emp._id})
					.exec(callback);
			},
			employerInstance: function(callback){
				Employer.findById(req.session.emp._id)
					.exec(callback);
			}
		}, function(err,results){
			if (err) { return next(err);}
			console.log(results.ImageFunction);
			res.render('./Employer_profile_post', { title: 'Post a Job', employer: results.employerInstance, image: results.ImageFunction, store_Emp: 'session alive'})
		})}
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
			},
			ImageFunction: function(callback){
				Image.findOne({'user_id': store_Emp._id})
				.exec(callback)
			}
		},function(err, results) {
		  if (err) { return next(err); }
		  res.render('./Employer_profile_posted', {title: 'Posted Jobs', postedJobs: results.jobFunc, image: results.ImageFunction, employer: results.employFunc, numApplicants: results.applicantsCount, store_Emp: 'session alive'});
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
				Employer.findById(store_Emp._id)
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
	var store_Emp = req.session.emp;
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
		res.render('./job_view', { title: 'Job details', store_Emp: "sessions alive", job: results.job, employer_poster: results.employer_poster, employer: results.employer, store_Emp: 'session alive' });
	  });
	}
	
	else {
		var store_User = req.session.user;
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
                        
                        res.render('./job_view', {job: results.job, store_User: "session alive", employer_poster: results.employer_poster, employer: null, status: 'applied', fav: true});
                    }
                    /* have not fav job */
                    else {
                        console.log('fav: false');

                        res.render('./job_view', {job: results.job, store_User: "session alive", employer_poster: results.employer_poster, employer: null, status: 'applied', fav: false});
                    }
                }
                else {
                    /* have not applied to job*/
                    console.log('job status: not applied')
                    /* favourited job */
                    if (results.student.favouriteJobs.indexOf(req.params.id) > -1) {
                        console.log('fav: true');

                        res.render('./job_view', {job: results.job, store_User: "session alive", employer_poster: results.employer_poster, employer: null, status: 'notApplied', fav: true});
                    }
                    /* have not fav job */
                    else {
                        console.log('fav: false');
                        
                        res.render('./job_view', {job: results.job, store_User: "session alive", employer_poster: results.employer_poster, employer: null, status: 'notApplied', fav: false});
                    }
                }
            }
            else {
                console.log('not logged in');
                console.log(results.employer_poster);
                res.render('./job_view', {job: results.job, employer_poster: results.employer_poster, employer: null, status: 'notApplied', fav: false});
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
                res.render('./job_view', {job: results.job, employer_poster: results.employer_poster, status: 'deleteSuccess', fav: true, store_User: 'session alive'});
            }
            /* have not fav job */
            else {
                console.log('fav: false');
                res.render('./job_view', {job: results.job, employer_poster: results.employer_poster, status: 'deleteSuccess', fav: false, store_User: 'session alive'});
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
	res.render('./Sign_up_Employer', {title: 'Employer Sign-Up'});
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
	
    var user_flag = false;
    var email_flag = false;
    var user_space = false;
    var pass_space = false;

    Employer.find({'username': req.body.username}, function(err,user){
        if(err){
            console.log('Sign up error');
            throw err;
        }
        //found at least 1 user
        if(user!=null){
            console.log('Username already exists: ' + username);
            user_flag = true;
            req.flash('status_Username', 'Username already exists, please choose another Username');
        }
    });

    Employer.find({'email': req.body.email}, function(err,user){
        if(err){
            console.log('Sign up error');
            throw err;
        }
        //found at least 1 user
        if(user!=null){
            console.log('Email already exists: ' + email);
            email_flag = true;
            req.flash('status_Email', 'Email already exists, please choose another Email');
        }

    });  

    if (/\s/.test(username)) {
        // username contains whitespace - return error
        user_space = true;
        console.log('user has spaces');
        req.flash('space_Username', 'Username cannot contain blank spaces');
    }

    if (/\s/.test(password)) {
        // username contains whitespace - return error
        pass_space = true;
        console.log('pass has spaces')
        req.flash('space_Pass', 'Password cannot contain blank spaces');
    }
    
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
			},
			isLength: {
				options: [{min: 8, max:15}],
				errorMessage: "Phone number: min 8 numbers"
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
	
    // create an employer object
    var newEmployer = new Employer({
        username: req.body.username,
        password: req.body.password,
        name: req.body.name,
        phoneNum: req.body.phoneNum,
        email: req.body.email,
        aboutme: '',
    });
	
    if (errors || email_flag === true || user_flag === true || user_space == true || pass_space == true) {
        if(email_flag == true && user_flag == false){
            if(user_space == true){
                if(pass_space == true){
                    res.render('./Sign_up_Employer', {
                        errors: errors, status_Username: 'Username already exists, please choose another Username', space_Pass: 'Password cannot contain blank spaces' , space_Username: 'Username cannot contain blank spaces', employer: newEmployer
                    });
                }
                else{  
                    res.render('./Sign_up_Employer', {
                        errors: errors, status_Username: 'Username already exists, please choose another Username', space_Username: 'Username cannot contain blank spaces', employer: newEmployer
                    });
                }
            }
            else{
                if(pass_space == true){
                    res.render('./Sign_up_Employer', {
                        errors: errors, status_Username: 'Username already exists, please choose another Username', space_Pass: 'Password cannot contain blank spaces', employer: newEmployer
                    });
                }
                else{
                    res.render('./Sign_up_Employer', {
                        errors: errors, status_Username: 'Username already exists, please choose another Username', employer: newEmployer
                    });
                }
            }
            res.render('./Sign_up_Employer', {
                errors: errors, status_Email: 'Email already exists, please choose another Email', employer: newEmployer
            });
        }
        else if(email_flag == true && user_flag == true){
            if(user_space == true){
                if(pass_space == true){
                    res.render('./Sign_up_Employer', {
                        errors: errors, status_Username: 'Username already exists, please choose another Username', space_Pass: 'Password cannot contain blank spaces' , space_Username: 'Username cannot contain blank spaces', employer: newEmployer
                    });
                }
                else{
                    res.render('./Sign_up_Employer', {
                        errors: errors, status_Username: 'Username already exists, please choose another Username', space_Username: 'Username cannot contain blank spaces', employer: newEmployer
                    });
                }
            }
            else{
                if(pass_space == true){
                    res.render('./Sign_up_Employer', {
                        errors: errors, status_Username: 'Username already exists, please choose another Username', space_Pass: 'Password cannot contain blank spaces', employer: newEmployer
                    });
                }
                else{
                    res.render('./Sign_up_Employer', {
                        errors: errors, status_Username: 'Username already exists, please choose another Username', employer: newEmployer
                    });
                }
            }
            res.render('./Sign_up_Employer', {
                errors: errors, status_Username: 'Username already exists, please choose another Username', status_Email: 'Email already exists, please choose another Email', employer: newEmployer
            });
        }
        else if(email_flag == false && user_flag == true){
            if(user_space == true){
                if(pass_space == true){
                    res.render('./Sign_up_Employer', {
                        errors: errors, status_Username: 'Username already exists, please choose another Username', space_Pass: 'Password cannot contain blank spaces' , space_Username: 'Username cannot contain blank spaces', employer: newEmployer
                    });
                }
                else{
                    res.render('./Sign_up_Employer', {
                        errors: errors, status_Username: 'Username already exists, please choose another Username', space_Username: 'Username cannot contain blank spaces', employer: newEmployer
                    });
                }
            }
            else{
                if(pass_space == true){
                    res.render('./Sign_up_Employer', {
                        errors: errors, status_Username: 'Username already exists, please choose another Username', space_Pass: 'Password cannot contain blank spaces', employer: newEmployer
                    });
                }
                else{
                    res.render('./Sign_up_Employer', {
                        errors: errors, status_Username: 'Username already exists, please choose another Username', employer: newEmployer
                    });
                }
            }

        }
        else{
            if(user_space == true){
                if(pass_space == true){
                    res.render('./Sign_up_Employer', {
                        errors: errors, status_Username: 'Username already exists, please choose another Username', space_Pass: 'Password cannot contain blank spaces' , space_Username: 'Username cannot contain blank spaces', employer: newEmployer
                    });
                }
                else{
                   res.render('./Sign_up_Employer', {
                        errors: errors, status_Username: 'Username already exists, please choose another Username', space_Username: 'Username cannot contain blank spaces', employer: newEmployer
                    }); 
                }
            }
            else{
                if(pass_space == true){
                    res.render('./Sign_up_Employer', {
                        errors: errors, status_Username: 'Username already exists, please choose another Username', space_Pass: 'Password cannot contain blank spaces', employer: newEmployer
                    });
                }
                else{
                    
                }
            }
            res.render('./Sign_up_Employer', {
                errors: errors, employer: newEmployer
            });
        }   
    }
	else {
		Employer.createEmployer(newEmployer, function(err,user) {
			if (err) throw err;
			var newImage = new Image();
			newImage.img.contentType = 'image/png';
			newImage.user_id = user._id;
			newImage.file_name = 'Building-vector.jpg';
			newImage.save();
			console.log(user);
		}) 

		
		req.flash('status', 'Thank you for registering with Adsoc, you may now login');

		res.redirect('/login_employer');
	}
}


//Job post edit

exports.edit_jobpost_get = function(req, res, next) {
	if(!req.session.emp) {
			res.redirect('/employer/login');
		}
	else {
		var store_Emp = req.session.emp;
		console.log(store_Emp);
		async.parallel({
			employFunc: function(callback){
				Employer.findOne({_id: req.session.emp._id})
					.exec(callback);
			},
			ImageFunction: function(callback){
				Image.findOne({user_id: req.session.emp._id})
					.exec(callback);
			},
			Jobfunction: function(callback){
				Job.findOne({_id: req.params.id})
					.exec(callback)
			}
		}, function(err, results) {
			if(err) {
				console.log(err);
				throw err;
			} 
			res.render('./Edit_Job_Post', {title: 'Edit Job post', job: results.Jobfunction, employer: results.employFunc, image: results.ImageFunction, store_Emp: 'session alive'});
		}); 
	}
};

exports.edit_jobpost_post = function(req,res,next) {
	req.checkBody('job_name', 'Job name is required').notEmpty();

	var err_update = req.validationErrors();

	// create a student object
	
	if (err_update) {
        async.parallel({
            UpdateFunction: function(callback){
                Employer.findById(req.session.emp._id)
                    .exec(callback);
            },
            Jobfunction: function(callback){
            	Job.findOne({_id: req.params.id})
            		.exec(callback);
            } 
        }, function(err, results){
            if (err) { return next(err); }
            console.log(err_update);
            res.render('./Edit_Job_Post', { err_update: err_update, student: results.UpdateFunction, job: results.Jobfunction });        
        })      
	}
	else {
		var store_Emp = req.session.emp;

		async.parallel({
			Jobfunction: function(callback){
				Job.findById(req.params.id)
					.exec(callback);
			},
			UpdateFunction: function(callback){
				Employer.findById(req.session.emp._id)
					.exec(callback);
			}
		}, function(err, results) {
		  	if (err) { return next(err); }
		  	if(req.body.job_name)
				results.Jobfunction.name = req.body.job_name;
			if(req.body.job_desc)
				results.Jobfunction.desc = req.body.job_desc;
			if(req.body.job_start_date)
				results.Jobfunction.startDate = req.body.job_start_date;
			if(req.body.job_end_date)
				results.Jobfunction.endDate = req.body.job_end_date;
			if(req.body.job_remun)
				results.Jobfunction.remun = req.body.job_remun;
			if(req.body.job_skill_type)
				results.Jobfunction.skill_type = req.body.job_skill_type;
			results.Jobfunction.save();
			console.log(results.Jobfunction);

			//console.log(results.ImageFunction.user_id);
			req.flash('status', 'Your profile has been successfully updated!'); 
		  	res.render('./Edit_Job_Post', {employer: results.UpdateFunction, job: results.Jobfunction, status: "Job post Updated!", store_Emp:'session alive'});
		});
	}
}