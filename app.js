var express = require('express');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var expressValidator = require('express-validator');
var session = require('express-session');
var flash = require('connect-flash');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var util = require('util');
var helmet = require('helmet');
var ajax = require('ajax');

var multer = require('multer');
var bodyParser = require('body-parser');
var path = require('path');
var fs = require('fs');

// import routes
var searchPage = require('./routes/searchPage');
var home = require('./routes/home');
var student = require('./routes/student');
var employer = require('./routes/employer');

var app = express();
var mongoose = require('mongoose');
var mongoDB = process.env.MONGODB_URI || 'mongodb://moonface:orbital2017@ds131742.mlab.com:31742/adsoc';
mongoose.Promise = global.Promise;
mongoose.connect(mongoDB);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('jade', require('jade').__express);
app.set('view engine', 'jade');


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

//Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

//flash 
app.use(flash());

app.use(helmet());

//Express Session
app.use(session({
	secret: 'secret',
	saveUninitialized: true,
	resave: true
}));

// /images which will serve as our final path of the uploaded images
app.use(express.static(__dirname + '/public'));
app.use('/image', express.static(__dirname + '/writable'));

//Passport Init
app.use(passport.initialize());
app.use(passport.session());

//Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

//query jquery-confirm
//app.use(confirm());

//Global Var
app.use(function(req, res, next){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.emp = req.emp || null;
    res.locals.user = req.user || null;
    next();
})	

app.use('/', home);
app.use('/searchPage', searchPage);
app.use('/student', student);
app.use('/employer', employer);

//Set Port
app.set('port', (process.env.PORT || 8080));

app.listen(app.get('port'), function(){
	console.log('Server started on port ' + app.get('port'));
});

module.exports = app;
