var mongoose = require('mongoose'),
var Login = require('./login-model');

var connStr = 'mongodb://localhost:27017/mongoose-bcrypt-test';
mongoose.connect(connStr, function(err) {
    if (err) throw err;
    console.log('Successfully connected to MongoDB');
});

// create a login a new login
var testLogin = new Login({
    loginname: 'jmar777',
    password: 'Password123'
});

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