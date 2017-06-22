var express = require('express');
var router = express.Router();

var signup_controller = require('../controllers/signupController');
    
router.get('/student', signup_controller.signup_student_create_get);

router.get('/employer', signup_controller.signup_employer_create_get);

router.post('/student', signup_controller.signup_student_create_post);

router.post('/employer', signup_controller.signup_employer_create_post);

module.exports = router;