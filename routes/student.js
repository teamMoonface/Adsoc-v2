var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var Student = require('../models/student');

var studentDB_controller = require('../controllers/studentdbController');


/* GET request for list of all Students. */
router.get('/signup/list', studentDB_controller.student_list);

/* GET request creating new Student account*/
router.get('/signup', studentDB_controller.signup_student_create_get);

//* POST creating new Student account*/
router.post('/signup', studentDB_controller.signup_student_create_post);

/* GET Login for Student*/
router.get('/login', function(req, res, next) {
  res.render('./Login_Student', { message: req.flash('message') });
});

//random stuff
passport.use('student-login', new LocalStrategy({
    passReqToCallback : true
  },
  function(req,username, password, done) {
    Student.getUserByUsername(username, function(err,user){
        if (err) throw err;
        if(!user){
            console.log(username);
            return done(null, false, req.flash('message', 'No user found.'));
        }
        Student.comparePassword(password, user.password, function(err, isMatch){
            if (err) throw err;
            if(isMatch){
                return done(null, user);
            } else{
                console.log(password);
                return done(null, false, req.flash('message', 'Invalid password'));
            }
        })
    }) 
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  Student.getUserById(id, function(err, user) {
    done(err, user);
  });
});

/* POST Student login*/
router.post('/login', 
  passport.authenticate('student-login', {failureRedirect: '/student/login', failureFlash: true }),
  function(req,res) { 
    var username = req.body.username;
    console.log(username);
    Student.findOne({'username': username}, function(err, user){
      if (err) { return next(err); }
        req.session.user = user;
        res.redirect('/student/profile');
    });
});

router.get('/logout', function(req,res) {
    req.logout();

    req.flash('success_logout', 'You are logged out');

    res.redirect('/student/login');

    console.log(req.session.user);
    
    req.session.destroy();
});


//Student database section

router.get('/profile', studentDB_controller.profile_get);

router.post('/profile', studentDB_controller.profile_post);

router.get('/appliedjobs', studentDB_controller.applied_jobs_get);

router.get('/favourites', studentDB_controller.favourites_get);

/* GET request for student profile-non private*/
router.get('/', studentDB_controller.open_profile_get);

module.exports = router;