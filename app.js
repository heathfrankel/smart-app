const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const indexRouter = require('./routes/index');
const launchRouter = require('./routes/launch');
const authcallbackRouter = require('./routes/authcallback');
const qs = require('qs');
const session = require('express-session');

const app = express();

// *********************************
// App Authorization Client ID

app.locals.client_id = 'my_web_app';

// *********************************

// set up session cookie
const oneHour = 1000 * 60 * 60;
const sess = {
  secret: 'GF0aWVudF9iYW5uZXIiOmZhbHNlLCJzb',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: oneHour }
}
app.set('trust proxy', 1) // trust first proxy
if (app.get('env') === 'production') {
  sess.cookie.secure = true // serve secure cookies
}  
app.use(session(sess));

// set res.locals from req.session
app.use(function(req, res, next) {
  //const query = qs.stringify(req.query, null, 2);
  //console.log(`${req.method} ${req.path}${query == "" ? "" : "?" + query}`);
  console.log(`--- ${req.method} ${req.path}`);

  res.locals.fhir_base_url = req.session.fhir_base_url;
  res.locals.access_token = req.session.access_token;
  res.locals.scopes = req.session.scopes;
  res.locals.id_token = req.session.id_token;
  res.locals.patient = req.session.patient;
  
  //console.log(`res.locals - ${JSON.stringify(res.locals, null, 2)}`);
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/launch', launchRouter);
app.use('/authcallback', authcallbackRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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