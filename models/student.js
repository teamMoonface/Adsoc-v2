var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var StudentSchema = Schema (
    {
        username: {type: String, required: true, min: 5, max: 15},
        password: {type: String, required: true, min: 6},
        name: {type: String, required: true},
        phoneNum: {type: Number},
        dob: {type: Date},
        email: {type: String, required: true},
        gender: {type: String, enum: ['Male', 'Female']},
        aboutme: {type: String, max: 500},
        experienceList: [{type: Schema.ObjectId, ref: 'Experience'}],
        skillsList: [{type: Schema.ObjectId, ref: 'Skill'}],
        appliedJobs: [{type: Schema.ObjectId, ref: 'Job'}]
    }
);

// can add in a email + password verifyer later
// (email must be valid, password a certain complexity)

module.exports = mongoose.model('Student', StudentSchema);