var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var JobSchema = Schema(
    {
        name: {type: String, required: true, min: 5, max: 100},
        periodStart: {type: Date},
        periodEnd: {type: Date},
        remun: {type: Number}, // remuneration
        employer: {type: Schema.ObjectId, ref: 'Employer'},
        applicants: [{type: Schema.ObjectId, ref: 'Student'}]
    }
);

// add periodStart < periodEnd verifyer

module.exports = mongoose.model('Job', JobSchema);