var Student = require('../models/student');
var Employer = require('../models/employer');
var Job = require('../models/job')

var Experience = require('../models/experience');

var Image = require('../models/images');
  
var fs = require('fs');
var imgPath = '/public/uploads/hj.jpg';  

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
    console.log(req.session.user);
    var exp = new Experience({
        title: req.body.exp_heading,
        desc: req.body.exp_body,
        student_id: store_User._id,
    });  

    if (errors) {
        //show 'unable to update message'
        async.parallel({
            ImageFunction: function(callback){
                Image.findOne({user_id: req.session.user._id})
                    .exec(callback);
            },
            expList: function(callback) {
                Experience.find({'student_id': store_User._id})
                    .exec(callback);
            },
            UpdateFunction: function(callback){
                Student.findById(store_User._id)
                    .exec(callback);
            }
        }, function(err, results) {
                if (err) { return next(err); }
                console.log(errors);
                res.render('./Student_profile', {errors: errors, store_User: "session alive", expList: results.expList, student: results.UpdateFunction, image: results.ImageFunction});        
        })
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
            },
            ImageFunction: function(callback) {
                Image.findOne({'user_id': store_User._id})
                    .exec(callback);
            }
        }, function(err, results) {
            if (err) { return next(err); }
            console.log(req.session.user);
            res.render('./Student_profile', {title: 'Profile', image: results.ImageFunction, student: results.studentInstance, expList: results.expList, store_User: 'session alive'});
        });
};


exports.profile_post = function(req,res,next) {

    req.checkBody('fullname', 'Name is required').notEmpty();
    if(req.file!= null)
        var file_name = req.file.filename;
    console.log(req.file);
    // run validators
    var err_update = req.validationErrors();
    
    // create a student object
    
    if (err_update) {
        async.parallel({
           ImageFunction: function(callback){
                Image.findOne({user_id: req.session.user._id})
                    .exec(callback);
            },
            UpdateFunction: function(callback){
                Student.findById(req.session.user._id)
                    .exec(callback);
            } 
        }, function(err, results){
            if (err) { return next(err); }
            console.log(err_update);
            res.render('./Student_profile', { err_update: err_update, student: results.UpdateFunction, image: results.ImageFunction });        
        })
    }
    else {
        var store_User = req.session.user;

        async.parallel({
            ImageFunction: function(callback){
                Image.findOne({user_id: req.session.user._id})
                    .exec(callback);
            },
            UpdateFunction: function(callback){
                Student.findById(req.session.user._id)
                    .exec(callback);
            }
        }, function(err, results){

            if (err) { return next(err); }
            if(req.body.fullname)
                results.UpdateFunction.name = req.body.fullname;
            if(req.body.phoneNum)
                results.UpdateFunction.phoneNum = req.body.phoneNum;
            if(req.body.dob)
                results.UpdateFunction.dob = req.body.dob;
            if(req.body.gender)
                results.UpdateFunction.gender = req.body.gender;
            if(req.body.aboutme)
                results.UpdateFunction.aboutme = req.body.aboutme;
            if(req.file != null)
                results.ImageFunction.file_name = file_name;

            results.UpdateFunction.save();
            results.ImageFunction.save();
            console.log(results.UpdateFunction);

            req.flash('status', 'Your profile has been successfully updated!');
            
            res.render('./Student_profile',{ student: results.UpdateFunction, image: results.ImageFunction, status: "profileUpdated", store_User: "session alive"});
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
    
    Student.find({'username': req.body.username}, function(err,user){
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

    Student.find({'email': req.body.email}, function(err,user){
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