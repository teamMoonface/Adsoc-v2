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


//Student database section

router.get('/profile', studentDB_controller.profile_get);

router.post('/profile', studentDB_controller.profile_post);

router.get('/appliedjobs', studentDB_controller.applied_jobs_get);

router.get('/favourites', studentDB_controller.favourites_get);

/* GET request for student profile-non private*/
router.get('/', studentDB_controller.open_profile_get);

module.exports = router;