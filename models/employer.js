var mongoose = require('mongoose');
var moment = require('moment');
var bcrypt = require('bcrypt');

var Schema = mongoose.Schema;

var EmployerSchema = Schema(
    {
        username: {type: String, required: true, min: 5, max: 15},
        password: {type: String, required: true, min: 6},
        name: {type: String, required: true},
        phoneNum: {type: Number},
        email: {type: String},
        aboutme: {type: String},
        postedJobs: [{type: Schema.ObjectId, ref: 'Job'}],
    }
)

/******** INDEXING *******/
EmployerSchema.index({name: 1}, {'name': 'text'});

/******** VIRTUALS *******/

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
  return '/employer/profile';
});

EmployerSchema
.virtual('postedJobs_url')
.get(function () {
  return '/employer/postedJobs';
});

EmployerSchema
.virtual('postJob_url')
.get(function () {
  return '/employer/postJob';
});

//Export model
var Employer = module.exports = mongoose.model('Employer', EmployerSchema);

module.exports.createEmployer =  function(newEmployer, callback){
  var bcrypt = require('bcryptjs');
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newEmployer.password, salt, function(err, hash) {
        newEmployer.password = hash;
        newEmployer.save(callback);
    });
  });
}

module.exports.getUserByUsername = function(username, callback){
  var query = {'username': username};
  Employer.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
  Employer.findById(id,callback)
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
  bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
      if(err) throw err;
      callback(null, isMatch);
  });
}