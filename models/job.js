var mongoose = require('mongoose');
var moment = require('moment');
var mongoosePaginate = require('mongoose-paginate');

var Schema = mongoose.Schema;

var JobSchema = Schema(
    {
        name: {type: String, required: true, min: 5, max: 100},
        desc: {type: String, required: true, max: 1000},
        posted_date: {type:Date, default: Date.now()},
        startDate: {type: Date},
        endDate: {type: Date},
        skill_type: {type: String, required: true, enum :['Frontend', 'Backend', 'Fullstack']},
        remun: {type: Number}, // remuneration
        employer: {type: Schema.ObjectId, ref: 'Employer'},
        applicants: [{type: Schema.ObjectId, ref: 'Student'}],
    }
);

/******** INDEXING *******/
JobSchema.index({name: 1, desc: 1, posted_date: 1, skill_type: 1, remun: 1}, {'name': 'text', desc: 'text'});

/******* VIRTUALS *******/
JobSchema
.virtual('date_posted_formatted')
.get(function () {
  return moment(this.posted_date).format('DD MMMM YYYY');
});

JobSchema
.virtual('date_start_formatted')
.get(function () {
  return moment(this.dob).format('DD MMMM YYYY');
});

JobSchema
.virtual('date_end_formatted')
.get(function () {
  return moment(this.dob).format('DD MMMM YYYY');
});

JobSchema
.virtual('url')
.get(function () {
  return '/employer/listed-job/' + this._id;
});

JobSchema
.virtual('viewApplicantsURL')
.get(function() {
    return '/employer/job/' + this._id + '/viewApplicants'
});

JobSchema
.virtual('posted_url')
.get(function(){
  return '/employer/' +this.employer
})

JobSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Job', JobSchema);