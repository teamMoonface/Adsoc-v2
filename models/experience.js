var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ExperienceSchema = Schema(
    {
        title: {type: String, required: true},
        desc: {type: String, required: true}
    }
);

module.exports = mongoose.model('Experience', ExperienceSchema);