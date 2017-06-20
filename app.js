//username: orbital_moonfacer
//password: m00nFacer
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// import routes
var index = require('./routes/index');
var studentDB = require('./routes/studentDB');
var employerDB = require('./routes/employerDB');
var searchPage = require('./routes/searchPage');
var home = require('./routes/home')
var login = require('./routes/login');

var app = express();
var mongoose = require('mongoose');
var mongoDB = 'mongodb://adminUser:6tq7yw8ue@ds163721.mlab.com:63721/local_library';
mongoose.connect(mongoDB);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/studentDB', studentDB);
app.use('/employerDB', employerDB);
app.use('/searchPage',searchPage);
app.use('/home',home);
app.use('/login',login);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
