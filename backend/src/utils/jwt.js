const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const JWT_SECRET = process.env.JWT_SECRET || "SentinelXJWTSecretSentinelXJWTSecret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "SentinelXJWTRefreshSecretSentinelXJWTRefreshSecret";

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id || user._id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (user) => {
  const jti = uuidv4();
  const token = jwt.sign(
    { id: user.id || user._id, role: user.role, jti },
    JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  return { token, jti };
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_REFRESH_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};
