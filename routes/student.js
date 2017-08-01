var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var Student = require('../models/student');

var multer = require('multer');

var studentDB_controller = require('../controllers/studentdbController');


/* GET request for list of all Students. */
router.get('/signup/list', studentDB_controller.student_list);

/* GET request creating new Student account*/
router.get('/signup', studentDB_controller.signup_student_create_get);

//* POST creating new Student account*/
router.post('/signup', studentDB_controller.signup_student_create_post);


//Student database section

router.get('/profile', studentDB_controller.profile_get);

router.post('/profile', multer({ dest: './public/uploads/'}).single('filename'), studentDB_controller.profile_post);

router.post('/add_experience', studentDB_controller.add_experience);

router.post('/delete_exp', studentDB_controller.delete_experience);

router.get('/appliedjobs', studentDB_controller.applied_jobs_get);

router.get('/favourites', studentDB_controller.favourites_get);

/* GET request for student profile-non private*/
router.get('/', studentDB_controller.open_profile_get);

module.exports = router;