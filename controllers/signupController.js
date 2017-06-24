var Student = require('../models/student');
var Employer = require('../models/employer');
var async = require('async');

// APIs: https://github.com/chriso/validator.js#validators, https://github.com/ctavan/express-validator/blob/master/README.md

//Everything Student related

// Display list of all Students
exports.student_list = function(req, res, next) {

  Student.find()
    .sort([['name', 'ascending']])
    .exec(function (err, list_students) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('student_list', { title: 'Student List', student_list: list_students });
    });

};

exports.signup_student_create_get = function(req, res, next) {
    res.render('signup_student', {title: 'Student Sign-Up'});
};

exports.signup_student_success = function(req, res, next) {
    res.render('signup_student_success');
};

exports.signup_student_create_post = function(req, res, next) {
    
    // check for validity
    req.checkBody('fullname', 'Full name required').notEmpty();
    req.checkBody('email', 'Email required').notEmpty();
    req.checkBody('username', 'Username required').notEmpty();   
    req.checkBody('password', 'Password required').notEmpty();
    
    // check only when field is not empty
    req.checkBody({
        'password': {
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
        
    // !! not done yet: check if username alr exists
    
    req.sanitize('fullname').escape();
    req.sanitize('fullname').trim();
    req.sanitize('email').escape();
    req.sanitize('email').trim();
    req.sanitize('phonenum').escape();
    req.sanitize('phonenum').trim();
    req.sanitize('username').escape();
    req.sanitize('password').escape();
    
    // run validators
    var errors = req.validationErrors();
    
    // create a student object
    var student = new Student({
        username: req.body.username,
        password: req.body.password,
        name: req.body.fullname,
        phonenum: req.body.phonenum,
        dob: req.body.dob,
        email: req.body.email,
        gender: req.body.gender,
    });
    
    if (errors) {
        res.render('signup_student', {title: 'Student Sign-Up', student: student, errors: errors});
        return;
    }
    else {
        student.save(function(err){
            if (err) { return next(err); }
            //fix url link between actual profile and link below
            res.redirect(student.url);
        });
    }
};

//Everything Employer related

// Display list of all Employers
exports.employer_list = function(req, res, next) {

  Employer.find()
    .sort([['name', 'ascending']])
    .exec(function (err, list_employers) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('employer_list', { title: 'Employer List', employer_list: list_employers });
    });

};

exports.signup_employer_create_get = function(req, res, next) {
    res.render('signup_employer', {title: 'Employer Sign-Up'});
};

exports.signup_employer_success = function(req, res, next) {
    res.render('signup_employer_success');
};

exports.signup_employer_create_post = function(req, res, next) {
    
    // check for validity
    req.checkBody('name', 'Company/Project name required').notEmpty();
    req.checkBody('email', 'Email required').notEmpty();
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
    
    req.sanitize('name').escape();
    req.sanitize('name').trim();
    req.sanitize('email').escape();
    req.sanitize('email').trim();
    req.sanitize('phonenum').escape();
    req.sanitize('phonenum').trim();
    req.sanitize('username').escape();
    req.sanitize('password').escape();
    
    // run validators
    var errors = req.validationErrors();
    
    // create an employer object
    var employer = new Employer({
        username: req.body.username,
        password: req.body.password,
        name: req.body.name,
        phonenum: req.body.phonenum,
        email: req.body.email,
    });
    
    if (errors) {
        res.render('signup_employer', {title: 'Employer Sign-Up', employer: employer, errors: errors});
        return;
    }
    else {
        employer.save(function(err) {
            if (err) { return next(err); }
            res.redirect(employer.url);
        })
    }
}