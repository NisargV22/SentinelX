const ApiError = require("../utils/ApiError");

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, "Access Forbidden: Insufficient Permissions"));
    }
    next();
  };
};

module.exports = { authorize };
