var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var EmployerSchema = Schema(
    {
        username: {type: String, required: true, min: 5, max: 15},
        password: {type: String, required: true, min: 6},
        name: {type: String, required: true},
        phoneNum: {type: Number},
        email: {type: String},
        about: {type: String, required: true},
        postedJobs: [{type: Schema.ObjectId, ref: 'Job'}]
    }
)

// email + pw verifyers

module.exports = mongoose.model('Employer', EmployerSchema);