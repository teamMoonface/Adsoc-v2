var Student = require('../models/student');
var Employer = require('../models/employer');
var Job = require('../models/job')
var async = require('async');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


exports.profile_get = function(req, res, next) {
    if(!req.session.user) {
        res.redirect('/');
    }
    console.log(req.session.user);
    var store_User = req.session.user;
    Student.findById(store_User._id)
        .exec(function(err, studentInstance) {
            if (err) { return next(err); }
            // successful, so render
            res.render('./Student_profile', {title: 'Profile', student: studentInstance, store_User: "session alive"});
        })

};


exports.profile_post = function(req,res,next) {

    req.checkBody('fullname', 'Name is required').notEmpty();

        // run validators
    var errors = req.validationErrors();
    
    // create a student object
    
    if (errors) {
        //show 'unable to update message'
        console.log(errors);
        res.render('./Student_profile', {
            errors: errors
        });        
    }
    else {
        Student.findOne({_id: req.session.user._id}, function(err, foundObject){
            console.log('hello can you see me 3');
            if(req.body.fullname)
                foundObject.name = req.body.fullname;
            if(req.body.phoneNum)
                foundObject.phoneNum = req.body.phoneNum;
            if(req.body.dob)
                foundObject.dob = req.body.dob;
            if(req.body.gender)
                foundObject.gender = req.body.gender;
            if(req.body.aboutme)
                foundObject.aboutme = req.body.aboutme;
            foundObject.save(function(err,updatedObject) {
                if(err) {
                    console.log(err);
                    res.status(500).send();
                } 
                else {                    
                    req.flash('status', 'Your profile has been successfully updated!');
                    res.render('./Student_profile',{ student: foundObject, status: "profileUpdated"});
                }
            });
        })
    };
        

};


//Open Student profile - open for everyone to view
exports.open_profile_get = function(req, res, next) {
    Student.findById(req.params.id)
        .exec(function(err, studentInstance) {
            if (err) { return next(err); }
            // successful, so render
            res.render('./Student_profile_view', {title: 'Profile', student: studentInstance});
        })       
};

exports.favourites_get = function(req, res, next) {
    if(!req.session.user) {
        res.redirect('/');
    }
    else {
        var store_User = req.session.user;
        async.parallel({
            studentInstance: function(callback) {
                Student.findById(store_User._id)
                    .populate('favouriteJobs')
                    .exec(callback);
            },
        }, function(err, results) {
            if (err) { return next(err); }
            console.log(req.session.user);
            res.render('./Student_profile_favourites', {title: 'Favourite Jobs', student: results.studentInstance, store_User: 'session alive'});
        });
    }
};

exports.applied_jobs_get = function(req, res, next) {
    if(!req.session.user) {
        res.redirect('/');
    }
    else {
        var store_User = req.session.user;
        async.parallel({
            studentInstance: function(callback) {
                Student.findById(store_User._id)
                    .exec(callback);
            },
            appliedJobs: function(callback) {
                Job.find({'applicants': store_User._id})
                    .populate('employer')
                    .exec(callback);
            }
        }, function(err, results) {
            if (err) { return next(err); }
            console.log(req.session.user);
            res.render('./Student_profile_appliedjobs', {title: 'Applied Jobs', student: results.studentInstance, appliedJobs: results.appliedJobs, store_User: 'session alive'});
        });
    }
};

//=========================================================DIVDER=========================================================
//=========================================================DIVDER=========================================================
//=========================================================DIVDER=========================================================


// Display list of all Students
exports.student_list = function(req, res, next) {

  Student.find()
    .sort([['name', 'ascending']])
    .exec(function (err, list_students) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('./A-Student_list', { title: 'Student List', student_list: list_students });
    });

};

exports.signup_student_create_get = function(req, res) {
    res.render('./Sign_up_Student', {title: 'Student Sign-Up'});
};

exports.signup_student_create_post = function(req, res,next) {
    
    var username =req.body.username;
    var password = req.body.password1;
    var password2 = req.body.password2;
    var name= req.body.fullname;
    var email= req.body.email;
    var phoneNum = req.body.phonenum;
    var dob = req.body.dob;
    var gender = req.body.gender;
    var aboutme = " ";

    // check for validity
    req.checkBody('fullname', 'Name is required').notEmpty();
    req.checkBody('email', 'Email required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();   
    req.checkBody('password1', 'Password is required').notEmpty();
    req.checkBody('password2', 'Password do not match').equals(req.body.password1);

    /*
    var result_Username = Student.find({'username': req.body.username}, function(err,user){
        if(err){
            console.log('Sign up error');
            throw err;
        }
        //found at least 1 user
        if(user.length!=0){
            console.log('Username already exists: ' + username);
            req.flash('status_Username', 'Username already exists, please choose another Username');
        }

    });

    var result_Email = Student.find({'email': req.body.email}, function(err,user){
        if(err){
            console.log('Sign up error');
            throw err;
        }
        //found at least 1 user
        if(user.length!=0){
            console.log('Email already exists: ' + email);
            req.flash('status_Email', 'Email already exists, please choose another Email');
        }

    });  
    */
    
    // check only when field is not empty
    
    req.checkBody({
        'password1': {
            optional: {
                options: { checkFalsy: true}
            },
            isLength: {
                errorMessage: 'Password: min 6 characters',
                options: [{min: 6}]
            }
        },
        'username': {
            optional: {
                options: { checkFalsy: true}
            },
            isLength: {
                errorMessage: 'Username: min 5 characters, max 15 characters',
                options: [{min: 5, max: 15}]
            },

        },
        'phoneNum': {
            optional: {
                options: {checkFalsy: true}
            },
            isNumeric: {
                errorMessage: 'Invalid phone number'
            }
        },
        'email': {
            optional: {
                options: { checkFalsy: true}
            },
            isEmail: {
                errorMessage: 'Invalid email address'
            }
        }
    });
    
    // run validators
    var errors = req.validationErrors();

    if (errors) {
        res.render('./Sign_up_Student', {
            errors: errors
        });
    }
    else {

        var newStudent = new Student({
            username: req.body.username,
            password: req.body.password1, 
            name: req.body.fullname,
            email: req.body.email,
            phoneNum: req.body.phoneNum,
            dob: req.body.dob,
            gender: req.body.gender,
            aboutme: " ",
        });

        Student.createStudent(newStudent, function(err,user) {
            if (err) throw err;
            console.log(user);
        }) 
        
        req.flash('status', 'Thank you for registering with Adsoc, you may now login');

        res.redirect('/login_student');
    }
};

