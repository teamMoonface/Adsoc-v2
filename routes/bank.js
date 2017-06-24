var express = require('express');
var router = express.Router();

var employerDB_controller = require('../controllers/employerdbController');
var studentDB_controller = require('../controllers/studentdbController');
var signup_controller =  require('../controllers/signupController');

//Sign up segment
//Everything Student related

/* GET request for list of all Students. */
router.get('/signup/students', signup_controller.student_list);

/* GET request creating new Student account*/
router.get('/signup/student', signup_controller.signup_student_create_get);

/* GET successful profile creation*/
router.get('/signup/student/signupSuccess', signup_controller.signup_student_success);

//* POST creating new Student account*/
router.post('/signup/student', signup_controller.signup_student_create_post);


//Everything Employer related

/* GET request for list of all Employers. */
router.get('/signup/employers', signup_controller.employer_list);

/* GET request creating new Employer account*/
router.get('/signup/employer', signup_controller.signup_employer_create_get);

/* GET successful profile creation*/
router.get('/signup/employer/signupSuccess', signup_controller.signup_employer_success);

/* POST creating new Employer account*/
router.post('/signup/employer', signup_controller.signup_employer_create_post);



//StudentDB segment
router.get('/studentDB/profile/:id', studentDB_controller.profile_get);

router.get('/studentDB/appliedjobs', function(req, res, next) {
  res.render('appliedjobs');
});

router.get('/studentDB/favourites', function(req, res, next) {
    res.render('favourites');
});


				
//EmployerDB segment
router.get('/employerDB/profile/:id', employerDB_controller.profile_get);

router.get('/employerDB/postedjobs/:id', function(req, res, next) {
    res.render('postedjobs');
});

/* GET request posting new job */
router.get('/employerDB/postjob/:id', employerDB_controller.postjob_get);

/* POST request posting new job */
router.post('/employerDB/postjob/:id', employerDB_controller.postjob_post);





module.exports = router;