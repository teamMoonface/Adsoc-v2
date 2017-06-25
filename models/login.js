var mongoose = require('mongoose');
var moment = require('moment'); 

var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

var LoginSchema = Schema(
    {
    	loginname: { type: String, required: true, index: { unique: true } },
    	password: { type: String, required: true }
    }
);

LoginSchema.pre('save', function(next) {
    var login = this;

    // only hash the password if it has been modified (or is new)
    if (!login.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password along with our new salt
        bcrypt.hash(login.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            login.password = hash;
            next();
        });
    });
});

LoginSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('Login', LoginSchema);