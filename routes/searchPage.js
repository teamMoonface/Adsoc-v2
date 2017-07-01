var express = require('express');
var router = express.Router();

var searchPagedb_controller =  require('../controllers/searchPagedbController');

/* GET request for list of all Students. */
router.get('/', searchPagedb_controller.job_list);

module.exports = router;