const AppError = require('../utils/appError');

const handleCastErrorDB = (err) =>
  new AppError('No tour found with that ID', 404);

const handleDuplicateFieldsDB = (err) => {
  const value =
    err.keyValue && Object.values(err.keyValue).length > 0
      ? Object.values(err.keyValue).join(', ')
      : err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0] || 'unknown';

  return new AppError(
    `Duplicate field value: ${value}. Please use another value!`,
    400,
  );
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;

  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  console.error('ERROR:', err);

  return res.status(500).json({
    status: 'error',
    message: 'Something went very wrong!',
  });
};

const convertDatabaseError = (err) => {
  let error = {
    ...err,
    name: err.name,
    message: err.message,
    code: err.code,
    errmsg: err.errmsg,
    keyValue: err.keyValue,
    path: err.path,
    value: err.value,
    errors: err.errors,
  };

  if (error.name === 'CastError') error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === 'ValidationError') error = handleValidationErrorDB(error);

  return error;
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  const error = convertDatabaseError(err);

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};
