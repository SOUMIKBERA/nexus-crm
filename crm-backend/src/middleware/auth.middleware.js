const { verifyAccessToken } = require('../utils/jwt.utils');
const ApiError = require('../utils/ApiError');
const User = require('../models/User.model');

/**
 * Protect routes - verify JWT token
 */
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new ApiError('Access denied. No token provided.', 401));
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select('-password -refreshToken');

    if (!user || !user.isActive) {
      return next(new ApiError('User not found or deactivated.', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError('Invalid token.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError('Token expired. Please refresh.', 401));
    }
    next(error);
  }
};

/**
 * Restrict to specific roles
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError('You do not have permission for this action.', 403));
    }
    next();
  };
};

module.exports = { protect, restrictTo };