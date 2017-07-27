var mongoose = require('mongoose');
var moment = require('moment'); 

var Schema = mongoose.Schema;

var ExperienceSchema = Schema(
    {
        title: {type: String, required: true},
        desc: {type: String, required: true},
        student_id: {type: String, required: true},
    }
);

module.exports = mongoose.model('Experience', ExperienceSchema);