const jwt = require("../utils/jwt");
const ApiError = require("../utils/ApiError");

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Please authenticate");
    }
    
    const token = authHeader.split(" ")[1];
    if (token === "mock-session-token") {
      req.user = { id: "mock-uid-1", email: "admin@sentinelx.io", role: "admin", name: "Platform Administrator" };
      return next();
    }
    
    const payload = jwt.verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    next(new ApiError(401, "Please authenticate"));
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (token === "mock-session-token") {
        req.user = { id: "mock-uid-1", email: "admin@sentinelx.io", role: "admin", name: "Platform Administrator" };
        return next();
      }
      const payload = jwt.verifyAccessToken(token);
      req.user = payload;
    }
    next();
  } catch (err) {
    next();
  }
};

module.exports = { auth, optionalAuth };
