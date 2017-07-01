var mongoose = require('mongoose'),
var Login = require('./login-model');

// save login to database
testLogin.save(function(err) {
    if (err) throw err;

    // fetch login and test password verification
    Login.findOne({ loginname: 'jmar777' }, function(err, login) {
        if (err) throw err;

        // test a matching password
        login.comparePassword('Password123', function(err, isMatch) {
            if (err) throw err;
            console.log('Password123:', isMatch); // -> Password123: true
        });

        // test a failing password
        login.comparePassword('123Password', function(err, isMatch) {
            if (err) throw err;
            console.log('123Password:', isMatch); // -> 123Password: false
        });
    });
});

exports.login_student_get = function(req, res, next){
    req.checkBody('username', 'Username required').notEmpty();
    req.checkBody('password', 'Password required').notEmpty();

    var errors = req.validationErrors();

    var login = new Login({
        username: req.body.username,
        password: req.body.password
    });

    Student.find({'name': username}){
        if()
    }
}

exports.login_employer_get = function(req, res, next){
    
}