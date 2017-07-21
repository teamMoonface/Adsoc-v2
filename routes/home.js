var express = require('express');
var router = express.Router();
var Student = require('../models/student');
var Employer = require('../models/employer');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


var employerDB_controller = require('../controllers/employerdbController');
var studentDB_controller = require('../controllers/studentdbController');

router.get('/', function(req, res, next) {  
  if(req.session.user){
    console.log('student session');
    var store_User = req.session.user
    Student.findById(req.session.user._id)
          .exec(function(err, studentInstance) {
            if (err) { return next(err); }
              return  res.render('./home', {title: 'home', student: studentInstance, store_User: 'session alive'});
         })}
  else if(req.session.emp){
    console.log('employer session');
    var store_Emp = req.session.emp
    Employer.findById(req.session.emp._id)
          .exec(function(err, employerInstance) {
            if (err) { return next(err); }
              return  res.render('./home', {title: 'home', employer: employerInstance, store_Emp: 'session alive'});
          })}
  else{
    console.log('no session');
    return res.render('./home', {title: 'home'});
  }
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
router.post('/login_student', 
  passport.authenticate('student-login', {failureRedirect: '/', failureFlash: true }),
  function(req,res) { 
    var username = req.body.username;
    console.log(username);
    Student.findOne({'username': username}, function(err, user){
      if (err) { return next(err); }
        req.session.user = user;
        res.redirect('/student/profile');
    });
});

router.get('/logout_student', function(req,res) {
    req.logout();

    req.flash('success_logout', 'You are logged out');

    res.redirect('/');

    console.log(req.session.user);
    
    req.session.destroy();
});


//employer log in

//random stuff
passport.use('employer-login', new LocalStrategy({
    passReqToCallback: true
  },
  function(req,username, password, done) {
    Employer.getUserByUsername(username, function(err,emp){
        if (err) throw err;
        if(!emp){
            console.log(username);
            return done(null, false, req.flash('message', 'No user found.'));
        }
        Employer.comparePassword(password, emp.password, function(err, isMatch){
            if (err) throw err;
            if(isMatch){
                return done(null, emp);
            } else{
                console.log(password);
                return done(null, false, req.flash('message', 'Invalid password'));
            }
        })
    }) 
  }));

passport.serializeUser(function(emp, done) {
  done(null, emp.id);
});

passport.deserializeUser(function(id, done) {
  Employer.getUserById(id, function(err, emp) {
    done(err, emp);
  });
});

/* POST Employer login*/
router.post('/login_employer', 
  passport.authenticate('employer-login', {failureRedirect: '/', failureFlash: true }),
	function(req,res) {	
    var username = req.body.username;
    console.log(username);
    Employer.findOne({'username': username}, function(err, emp){
      if (err) { return next(err); }
        req.session.emp = emp;
        console.log(emp);
        res.redirect('/employer/profile');
    });
  });


router.get('/logout_employer', function(req,res) {
    req.logout();

    res.redirect('/');

    success_msg: req.flash('success_msg');

    req.flash('success_msg', 'you are logged out');

    req.session.destroy();
});


/* GET request log in page*/
router.get('/login_employer', function(req, res, next){
  res.render('Login_Employer')
});

router.get('/login_student', function(req, res, next){
  res.render('Login_Student');
});

module.exports = router;