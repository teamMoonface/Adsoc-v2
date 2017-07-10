var express = require('express');
var router = express.Router();

var searchPagedb_controller =  require('../controllers/searchPagedbController');

/* GET request for list of all Students. */
router.get('/', searchPagedb_controller.job_list);

/*POST request for search bar*/
router.post('/search', searchPagedb_controller.search);

module.exports = router;