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

router.get('/studentDB/appliedjobs/:id', studentDB_controller.applied_jobs_get);

router.get('/studentDB/favourites/:id', studentDB_controller.favourites_get);

/* GET request for student profile-non private*/
router.get('/student_profile/:id', studentDB_controller.open_profile_get);


				
//EmployerDB segment
router.get('/employerDB/profile/:id', employerDB_controller.profile_get);

/* GET request view jobs posted*/
router.get('/employerDB/postedjobs/:id', employerDB_controller.postedjobsList);

/* GET request posting new job */
router.get('/employerDB/postjob/:id', employerDB_controller.postjob_get);

/* POST request posting new job */
router.post('/employerDB/postjob/:id', employerDB_controller.postjob_post);

<<<<<<< HEAD
// Job post segment

/* GET request to view job applicants */
router.get('/job/:id/viewApplicants', employerDB_controller.view_job_applicants
);
=======
/* GET Job details of specific job*/
router.get('/listed-job/:id', employerDB_controller.job_detail)

>>>>>>> master

module.exports = router;