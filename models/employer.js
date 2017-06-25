var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var EmployerSchema = Schema(
    {
        username: {type: String, required: true, min: 5, max: 15},
        password: {type: String, required: true, min: 6},
        name: {type: String, required: true},
        phoneNum: {type: Number},
        email: {type: String},
        about: {type: String},
        postedJobs: [{type: Schema.ObjectId, ref: 'Job'}]
    }
)

// Virtual for employer's full name
EmployerSchema
.virtual('_name')
.get(function () {
  return this.name;
});


// Virtual for employer's email
EmployerSchema
.virtual('_email')
.get(function () {
  return this.email;
});

// Virtual for employer's phone number
EmployerSchema
.virtual('_phonenum')
.get(function () {
  return this.phonenum;
});

// Virtual for employer's username
EmployerSchema
.virtual('_username')
.get(function () {
  return this.username;
});

// Virtual for employer's about
EmployerSchema
.virtual('_about')
.get(function () {
  return this.about;
});

// Virtual for employer's URL
EmployerSchema
.virtual('url')
.get(function () {
  return '/bank/employerDB/profile/' + this._id;
});

EmployerSchema
.virtual('postedJobs_url')
.get(function () {
  return '/bank/employerDB/postedJobs/' + this._id;
});

EmployerSchema
.virtual('postJob_url')
.get(function () {
  return '/bank/employerDB/postJob/' + this._id;
});

//Export model
module.exports = mongoose.model('Employer', EmployerSchema);