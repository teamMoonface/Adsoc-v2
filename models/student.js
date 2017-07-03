var mongoose = require('mongoose');
var moment = require('moment'); 

var Schema = mongoose.Schema;

var StudentSchema = Schema (
    {
        username: {type: String, required: true, min: 5, max: 15},
        password: {type: String, required: true, min: 6},
        name: {type: String, required: true},
        phoneNum: {type: Number},
        dob: {type: String},
        email: {type: String, required: true},
        gender: {type: String, required: true, enum: ['Male', 'Female']},
        aboutme: {type: String, max: 500},
        experienceList: [{type: Schema.ObjectId, ref: 'Experience'}],
        skillsList: [{type: Schema.ObjectId, ref: 'Skill'}],
        appliedJobs: [{type: Schema.ObjectId, ref: 'Job'}]
    }
);

// Virtual for employer's full name
StudentSchema
.virtual('_name')
.get(function () {
  return this.name;
});


// Virtual for employer's email
StudentSchema
.virtual('_email')
.get(function () {
  return this.email;
});

// Virtual for employer's phone number
StudentSchema
.virtual('_phonenum')
.get(function () {
  return this.phonenum;
});

// Virtual for employer's username
StudentSchema
.virtual('_username')
.get(function () {
  return this.username;
});

// Virtual for employer's about
StudentSchema
.virtual('_about')
.get(function () {
  return this.about;
});

// Virtual for student's URL
StudentSchema
.virtual('url')
.get(function () {
  return '/bank/studentDB/profile/' + this._id;
});

StudentSchema
.virtual('applied_url')
.get(function () {
  return '/bank/studentDB/appliedjobs/' + this._id;
});

StudentSchema
.virtual('favourites_url')
.get(function () {
  return '/bank/studentDB/favourites/' + this._id;
});

StudentSchema
.virtual('date_of_birth_formatted')
.get(function () {
  return moment(this.dob).format('YYYY-MM-DD');
});
// can add in a email + password verifyer later
// (email must be valid, password a certain complexity)

module.exports = mongoose.model('Student', StudentSchema);