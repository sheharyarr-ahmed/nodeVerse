const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => new AppError('Invalid ID', 404);

const handleDuplicateFieldsDB = (err) => {
  const duplicateFields = err.keyValue || {};
  const duplicateEntries = Object.entries(duplicateFields)
    .map(([field, value]) => `${field}: ${value}`)
    .join(', ');
  const duplicateValue =
    duplicateEntries || err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0] || 'unknown';

  return new AppError(
    `Duplicate field value: ${duplicateValue}. Please use another value!`,
    400,
  );
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;

  return new AppError(message, 400);
};

const sendDetailedErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendFriendlyErrorProd = (err, res) => {
  // Operational errors are trusted, expected errors we can show to users.
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  console.error('ERROR:', err);

  // Programming or unknown errors should not leak stack traces in production.
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
    stack: err.stack,
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

  if (process.env.NODE_ENV === 'development') {
    sendDetailedErrorDev(err, res);
  } else {
    const error = convertDatabaseError(err);

    sendFriendlyErrorProd(error, res);
  }
};
