var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var Employer = require('../models/employer');

var employerDB_controller = require('../controllers/employerdbController');


//Everything Employer related

/* GET request for list of all Employers. */
router.get('/signup/list', employerDB_controller.employer_list);

/* GET request creating new Employer account*/
router.get('/signup', employerDB_controller.signup_employer_create_get);

/* POST creating new Employer account*/
router.post('/signup', employerDB_controller.signup_employer_create_post);

/* GET request employer login*/
router.get('/login', function(req, res, next) {
  res.render('./Login_Employer', { message: req.flash('message') });
});

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
router.post('/login', 
  passport.authenticate('employer-login', {failureRedirect: '/employer/login', failureFlash: true }),
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


router.get('/logout', function(req,res) {
    req.logout();

    res.redirect('/employer/login');

    success_msg: req.flash('success_msg');

    req.flash('success_msg', 'you are logged out');

    req.session.destroy();
});


//Employer database segment
router.get('/profile', employerDB_controller.profile_get);

/* GET request view jobs posted*/
router.get('/postedjobs', employerDB_controller.postedjobsList);

/* GET request posting new job */
router.get('/postjob', employerDB_controller.postjob_get);

/* POST request posting new job */
router.post('/postjob', employerDB_controller.postjob_post);


// Job post segment
/* GET request to view job applicants */
router.get('/job/viewApplicants', employerDB_controller.view_job_applicants
);
/* GET Job details of specific job*/
router.get('/listed-job/:id', employerDB_controller.job_detail)

module.exports = router;