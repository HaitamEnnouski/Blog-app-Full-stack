const notFound = (req, res, next) => {
  res.status(404).json({
    error: { message: "Route not found" }
  });
};

module.exports = notFound;
