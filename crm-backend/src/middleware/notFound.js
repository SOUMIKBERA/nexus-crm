const ApiError = require('../utils/ApiError');

const notFound = (req, res, next) => {
  next(new ApiError(`Route ${req.originalUrl} not found`, 404));
};

module.exports =  notFound;