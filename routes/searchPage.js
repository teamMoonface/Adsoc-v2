var express = require('express');
var router = express.Router();

var employerDB_controller = require('../controllers/employerdbController');

router.get('/', employerDB_controller.job_list);

module.exports = router;