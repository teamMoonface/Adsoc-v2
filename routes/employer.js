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


//Employer database segment
/*GET request profile view*/
router.get('/profile', employerDB_controller.profile_get);

/*POST request profile view*/
router.post('/profile', employerDB_controller.profile_post);

/* GET request view jobs posted*/
router.get('/postedjobs', employerDB_controller.postedjobsList);

/* GET request posting new job */
router.get('/postjob', employerDB_controller.postjob_get);

/* POST request posting new job */
router.post('/postjob', employerDB_controller.postjob_post);


// Job post segment
/* GET request to view job applicants */
router.get('/job/:id/viewApplicants', employerDB_controller.view_job_applicants);

/* GET Job details of specific job*/
router.get('/listed-job/:id', employerDB_controller.job_detail);

/* GET request for students to apply job */
router.get('/listed-job/:id/apply', employerDB_controller.job_detail);

/* POST request for students to apply job */
router.post('/listed-job/:id/apply', employerDB_controller.apply_job);

/* POST request for students to delete job application */
router.post('/listed-job/:id/delete', employerDB_controller.delete_job);

/* POST request for students to fav job applications */
router.post('/listed-job/:id/addToFav', employerDB_controller.favourite_job);

/* POST request for students to remove job from fav */
router.post('/listed-job/:id/removeFromFav', employerDB_controller.remove_fav)

module.exports = router;