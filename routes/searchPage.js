var express = require('express');
var router = express.Router();

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var Employer = require('../models/employer');
var Student = require('../models/student');
var Job = require('../models/job');

var async = require('async');
var searchPagedb_controller =  require('../controllers/searchPagedbController');

router.get('/', searchPagedb_controller.job_list);

router.post('/search', searchPagedb_controller.search_result_JSON);

module.exports = router;