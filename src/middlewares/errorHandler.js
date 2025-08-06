const createError = require('http-errors');

function errorHandler(err, req, res, next) {
  // If the error is not an instance of http-errors, it's an unexpected server error.
  // Log it and treat it as a 500 error.
  if (!createError.isHttpError(err)) {
    console.error(err); // Log the full error for debugging
    err = createError(500, 'Internal Server Error');
  }

  res.status(err.status || 500);
  res.json({
    success: false,
    error: {
      status: err.status,
      message: err.message,
      // Optionally include stack trace in development
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    timestamp: new Date().toISOString()
  });
}

module.exports = { errorHandler, notFoundHandler };