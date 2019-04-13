require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const apiRouter = require('./routes/api/router');
const httpResponse = require('./app/helpers/http');
const db = require('./app/bootstrap');
const app = express();
const namespaces = {
  api: '/api/rest/v1'
};

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/***  Register routers  ***/
app.use(namespaces.api, apiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  let errorCode = err.status || 500;
  res.status(errorCode);
  res.json({
    responseType: httpResponse.responseTypes.error,
    ... httpResponse.error.server_error['c'+errorCode] || httpResponse.error.client_error['c'+errorCode],
    message: err.message
  });
});

/***  Sync Models with Tables  ***/
db.sequelize.sync().then(data => console.log('DB Sync Completed'));

module.exports = app;
