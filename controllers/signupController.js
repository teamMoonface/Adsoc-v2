var Student = require('../models/student');
var Employer = require('../models/employer');

exports.signup_student_create_get = function(req, res, next) {
    res.render('signup_student', {title: 'Student Sign-Up'});
};

exports.signup_employer_create_get = function(req, res, next) {
    res.render('signup_employer', {title: 'Employer Sign-Up'});
};

exports.signup_student_success = function(req, res, next) {
    res.render('signup_student_success');
};

exports.signup_employer_success = function(req, res, next) {
    res.render('signup_employer_success');
};

// APIs: https://github.com/chriso/validator.js#validators, https://github.com/ctavan/express-validator/blob/master/README.md

exports.signup_student_create_post = function(req, res, next) {
    
    // check for validity
    req.checkBody('fullname', 'Full name required').notEmpty();
    req.checkBody('email', 'Email required').notEmpty();
    req.checkBody('email', 'Invalid email').isEmail();
    req.checkBody('phonenum', 'Invalid number').optional().isNumeric();
    req.checkBody('username', 'Username required').notEmpty();
    req.checkBody('username', 'Min 5 characters and max 15 characters').isLength({min: 5, max: 15});
    req.checkBody('password', 'Password required').notEmpty();
    req.checkBody('password', 'Min 6 characters').isLength({min: 6});
    
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
        aboutme: req.body.about,
    });
    
    // !! not done yet: error page
    if (errors) {
        res.send(errors);
        //res.render('signup_student', {title: 'Student Sign-Up', student: student, errors: errors});
        return;
    }
    else {
        student.save(function(err){
            if (err) { return next(err); }
            res.redirect('/signup/student/signupsuccess');
        });
    }
};

exports.signup_employer_create_post = function(req, res, next) {
    
    // check for validity
    req.checkBody('name', 'Company/Project name required').notEmpty();
    req.checkBody('email', 'Email required').notEmpty();
    req.checkBody('email', 'Invalid email').isEmail();
    req.checkBody('phonenum', 'Invalid contact number').optional().isNumeric();
    req.checkBody('username', 'Username required').notEmpty();
    req.checkBody('username', 'Min 5 characters and max 15 characters').isLength({min: 5, max: 15});
    req.checkBody('password', 'Password required').notEmpty();
    req.checkBody('password', 'Min 6 characters').isLength({min: 6});
    
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
        about: req.body.about
    });
    
    // !! not done yet: error page
    if (errors) {
        res.send(errors);
        //res.render('signup_emploer', {title: 'Employer Sign-Up', employer: employer, errors: errors});
        return;
    }
    else {
        employer.save(function(err) {
            if (err) { return next(err); }
            res.redirect('/signup/employer/signupsuccess');
        })
    }
}