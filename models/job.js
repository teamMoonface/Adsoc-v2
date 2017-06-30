var mongoose = require('mongoose');
var moment = require('moment'); 

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

JobSchema
.virtual('date_start_formatted')
.get(function () {
  return moment(this.dob).format('YYYY-MM-DD');
});

JobSchema
.virtual('date_end_formatted')
.get(function () {
  return moment(this.dob).format('YYYY-MM-DD');
});

JobSchema
.virtual('url')
.get(function () {
  return '/bank/employerDB/postedJobs/' + this._id;
});

JobSchema
.virtual('viewApplicantsURL')
.get(function() {
    return '/bank/job/' + this._id + '/viewApplicants'
});

module.exports = mongoose.model('Job', JobSchema);