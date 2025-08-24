const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (res.headersSent) {
    return next(err); // Avoid double response
  }

  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error"
    }
  });
};

module.exports = errorHandler;
