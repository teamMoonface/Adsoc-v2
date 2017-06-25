var mongoose = require('mongoose');

var Schema = mongoose.Schema;

// to add in skills
var JobSchema = Schema(
    {
        name: {type: String, required: true, min: 5, max: 100},
        desc: {type: String, required: true, max: 1000},
        startDate: {type: Date},
        endDate: {type: Date},
        remun: {type: Number}, // remuneration
        employer: {type: Schema.ObjectId, ref: 'Employer'},
        applicants: [{type: Schema.ObjectId, ref: 'Student'}]
    }
);

// add date formatting
// add periodStart < periodEnd verifyer

module.exports = mongoose.model('Job', JobSchema);