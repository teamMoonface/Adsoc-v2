var Student = require('../models/student');
var Employer = require('../models/employer');
var async = require('async');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


exports.profile_get = function(req, res, next) {
    if(!req.session.user) {
        res.redirect('/student/login');
    }
    console.log(req.session.user);
    var store = req.session.user;
    Student.findById(store._id)
        .exec(function(err, studentInstance) {
            if (err) { return next(err); }
            // successful, so render
            res.render('./Student_profile', {title: 'Profile', student: studentInstance});
        })

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
        res.redirect('/student/login');
    }
    var store = req.session.user;
    Student.findById(store._id)
        .exec(function(err, studentInstance) {
            if (err) { return next(err); }
            // successful, so render
            console.log(req.session.user);
            return res.render('./Student_profile_favourites', {title: 'Favourites', student: studentInstance});
        }) 
};

exports.applied_jobs_get = function(req, res, next) {
    if(!req.session.user) {
        res.redirect('/student/login');
    }
    var store = req.session.user;
    Student.findById(store._id)
        .exec(function(err, studentInstance) {
            if (err) { return next(err); }
            // successful, so render
            console.log(req.session.user);
             return res.render('./Student_profile_appliedjobs', {title: 'Applied Jobs', student: studentInstance});
        }) 
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
    var phonenum = req.body.phonenum;
    var dob = req.body.dob;
    var gender = req.body.gender;

    // check for validity
    req.checkBody('fullname', 'Name is required').notEmpty();
    req.checkBody('email', 'Email required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();   
    req.checkBody('password1', 'Password is required').notEmpty();
    req.checkBody('password2', 'Password do not match').equals(req.body.password1);

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
            }
        },
        'phonenum': {
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
    
    // create a student object
    

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
            phonenum: req.body.phonenum,
            dob: req.body.dob,
            gender: req.body.gender,
      
        });

        Student.createStudent(newStudent, function(err,user) {
            if (err) throw err;
            console.log(user);
        }) 

        
        req.flash('success_msg', 'Thank you for registering with Adsoc, you may now login');

        res.redirect('/student/login');
    }
};

