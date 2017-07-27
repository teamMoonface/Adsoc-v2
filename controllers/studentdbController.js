var Student = require('../models/student');
var Employer = require('../models/employer');
var Job = require('../models/job')
var Experience = require('../models/experience');
var async = require('async');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

exports.delete_experience = function(req,res,next) {
    var store_User = req.session.user;
    var hiddenField = req.body.hiddenField;
    console.log('schizzlschizzle');
    async.parallel({
            student: function(callback) {
                Student.findByIdAndUpdate(store_User._id, {$pull: {experienceList: req.body.hiddenField}})
                    .exec(callback);
            },
            expList: function(callback) {
                Experience.findById(req.body.hiddenField)
                    .remove()
                    .exec(callback);
            }
        }, function(err, results) {
            if(err) { return next(err); }
            console.log('successfully removed Experience entry');
            res.redirect('/student/profile');      
        });
}

exports.add_experience = function(req,res,next) {
    req.checkBody('exp_heading', 'Title is required').notEmpty();
    req.checkBody('exp_body', 'Description is required').notEmpty();
    var errors = req.validationErrors();
    var store_User = req.session.user;

    var exp = new Experience({
        title: req.body.exp_heading,
        desc: req.body.exp_body,
        student_id: store_User._id,
    });

    if (errors) {
        //show 'unable to update message'
        console.log(errors);
        res.render('./Student_profile', {
            errors: errors
        });        
    }
    else {
        exp.save(function(err) {
            console.log('Experience saved');
            if (err) { return next(err); }           
            res.redirect('/student/profile');
        });
        Student.findByIdAndUpdate(store_User._id, {$push: {experienceList: exp}}, function(err) {
            console.log(err);
            console.log(store_User);
        });
    };    
}

exports.profile_get = function(req, res, next) {
    if(!req.session.user) {
        res.redirect('/');
    }
    console.log(req.session.user);
    var store_User = req.session.user;
    async.parallel({
            studentInstance: function(callback) {
                Student.findById(store_User._id)
                    .exec(callback);
            },
            expList: function(callback) {
                Experience.find({'student_id': store_User._id})
                    .exec(callback);
            }
        }, function(err, results) {
            if (err) { return next(err); }
            console.log(req.session.user);
            res.render('./Student_profile', {title: 'Profile', student: results.studentInstance, expList: results.expList, store_User: 'session alive'});
        });
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
    var user_flag = false;
    var email_flag = false;
    var result_Username = Student.find({'username': req.body.username}, function(err,user){
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

    var result_Email = Student.find({'email': req.body.email}, function(err,user){
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
    
    // create a student object
    

    if (errors || email_flag == true || user_flag == true) {
        res.render('./Sign_up_Student', {
            errors: errors, status_Username: 'Username already exists, please choose another Username', status_Email: 'Email already exists, please choose another Email'
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

