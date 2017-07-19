var mongoose = require('mongoose');
var moment = require('moment'); 
var bcrypt = require('bcrypt');

var Schema = mongoose.Schema;

var StudentSchema = Schema (
    {
        //During signup
        username: {type: String, required: true, min: 5, max: 15},
        password: {type: String, required: true, min: 6},
        name: {type: String, required: true},
        email: {type: String, required: true},
        phoneNum: {type: Number},
        dob: {type: String},
        gender: {type: String, required: true, enum: ['Male', 'Female']}, 
        //Not filled in during signup   
        aboutme: {type: String, max: 500},
        experienceList: [{type: Schema.ObjectId, ref: 'Experience'}],
        skillsList: [{type: Schema.ObjectId, ref: 'Skill'}],
        appliedJobs: [{type: Schema.ObjectId, ref: 'Job'}],
        favouriteJobs: [{type: Schema.ObjectId, ref: 'Job'}] 
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
  return '/student/profile';
});

StudentSchema
.virtual('applied_url')
.get(function () {
  return '/student/appliedjobs';
});

StudentSchema
.virtual('favourites_url')
.get(function () {
  return '/student/favourites';
});

StudentSchema
.virtual('date_of_birth_formatted')
.get(function () {
  return moment(this.dob).format('YYYY-MM-DD');
});
// can add in a email + password verifyer later
// (email must be valid, password a certain complexity)

var Student = module.exports = mongoose.model('Student', StudentSchema);

module.exports.createStudent =  function(newStudent, callback){
  var bcrypt = require('bcryptjs');
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newStudent.password, salt, function(err, hash) {
        newStudent.password = hash;
        newStudent.save(callback);
    });
  });
}

module.exports.getUserByUsername = function(username, callback){
  var query = {'username': username};
  Student.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
  Student.findById(id,callback)
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
  bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
      if(err) throw err;
      callback(null, isMatch);
  });
}