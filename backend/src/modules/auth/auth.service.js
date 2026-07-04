const mongoose = require("mongoose");
const User = require("./auth.model");
const AuditLog = require("../audit/audit.model");
const jwt = require("../../utils/jwt");
const redisClient = require("../../config/redis");
const ApiError = require("../../utils/ApiError");
const { ingestEvent } = require("../events/events.service");

const MOCK_USERS = [
  // 5 SOC Analysts
  { id: "mock-uid-soc1", name: "SOC Analyst 1", email: "analyst1@sentinelx.io", password: "Analyst@123456", role: "soc", status: "Active" },
  { id: "mock-uid-soc2", name: "SOC Analyst 2", email: "analyst2@sentinelx.io", password: "Analyst@123456", role: "soc", status: "Active" },
  { id: "mock-uid-soc3", name: "SOC Analyst 3", email: "analyst3@sentinelx.io", password: "Analyst@123456", role: "soc", status: "Active" },
  { id: "mock-uid-soc4", name: "SOC Analyst 4", email: "analyst4@sentinelx.io", password: "Analyst@123456", role: "soc", status: "Active" },
  { id: "mock-uid-soc5", name: "SOC Analyst 5", email: "analyst5@sentinelx.io", password: "Analyst@123456", role: "soc", status: "Active" },

  // 10 Employees
  { id: "mock-uid-emp1", name: "Employee Operator 1", email: "employee1@sentinelx.io", password: "Employee@123456", role: "employee", status: "Active" },
  { id: "mock-uid-emp2", name: "Employee Operator 2", email: "employee2@sentinelx.io", password: "Employee@123456", role: "employee", status: "Active" },
  { id: "mock-uid-emp3", name: "Employee Operator 3", email: "employee3@sentinelx.io", password: "Employee@123456", role: "employee", status: "Active" },
  { id: "mock-uid-emp4", name: "Employee Operator 4", email: "employee4@sentinelx.io", password: "Employee@123456", role: "employee", status: "Active" },
  { id: "mock-uid-emp5", name: "Employee Operator 5", email: "employee5@sentinelx.io", password: "Employee@123456", role: "employee", status: "Active" },
  { id: "mock-uid-emp6", name: "Employee Operator 6", email: "employee6@sentinelx.io", password: "Employee@123456", role: "employee", status: "Active" },
  { id: "mock-uid-emp7", name: "Employee Operator 7", email: "employee7@sentinelx.io", password: "Employee@123456", role: "employee", status: "Active" },
  { id: "mock-uid-emp8", name: "Employee Operator 8", email: "employee8@sentinelx.io", password: "Employee@123456", role: "employee", status: "Active" },
  { id: "mock-uid-emp9", name: "Employee Operator 9", email: "employee9@sentinelx.io", password: "Employee@123456", role: "employee", status: "Active" },
  { id: "mock-uid-emp10", name: "Employee Operator 10", email: "employee10@sentinelx.io", password: "Employee@123456", role: "employee", status: "Active" }
];

const register = async (userData) => {
  try {
    const dbOffline = mongoose.connection.readyState !== 1;
    if (dbOffline) {
      console.warn("DB offline. Simulating user registration in-memory.");
      return { ...userData, id: `mock-uid-${Date.now()}` };
    }
    const existing = await User.findOne({ email: userData.email.toLowerCase() });
    if (existing) {
      throw new ApiError(409, "Email already registered");
    }
    const user = new User(userData);
    await user.save();
    return user.toSafeObject();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    console.warn("DB offline. Simulating user registration in-memory.");
    return { ...userData, id: `mock-uid-${Date.now()}` };
  }
};

const login = async (email, password, ip, userAgent) => {
  const dbOffline = mongoose.connection.readyState !== 1;
  if (dbOffline) {
    throw new ApiError(503, "Database is currently offline. Authentication unavailable.");
  }

  const user = await User.findByEmail(email);

  if (!user || user.status === "Inactive") {
    try {
      ingestEvent({
        type: "failed_login",
        protocol: "HTTPS",
        srcPort: 443,
        destPort: 443,
        bytes: 120,
        duration: 0,
        requestCount: 1,
        sourceIP: ip || "127.0.0.1",
        destIP: "127.0.0.1",
        userEmail: email,
        timestamp: new Date().toISOString()
      }).catch(() => {});
    } catch (e) {}

    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    try {
      ingestEvent({
        type: "failed_login",
        protocol: "HTTPS",
        srcPort: 443,
        destPort: 443,
        bytes: 120,
        duration: 0,
        requestCount: 1,
        sourceIP: ip || "127.0.0.1",
        destIP: "127.0.0.1",
        userEmail: email,
        timestamp: new Date().toISOString()
      }).catch(() => {});
    } catch (e) {}
    try {
      await AuditLog.create({
        userId: user._id,
        email: user.email,
        action: "LOGIN_FAILED",
        ip,
        userAgent,
        metadata: { reason: "Incorrect password" }
      });
    } catch (e) {}
    throw new ApiError(401, "Invalid email or password");
  }

  const accessToken = jwt.generateAccessToken(user);
  const { token: refreshToken, jti } = jwt.generateRefreshToken(user);

  await redisClient.set(`jti:${jti}`, "active", "EX", 7 * 24 * 60 * 60);

  try {
    ingestEvent({
      type: "user_login",
      protocol: "HTTPS",
      srcPort: 443,
      destPort: 443,
      bytes: 150,
      duration: 0,
      requestCount: 1,
      sourceIP: ip || "127.0.0.1",
      destIP: "127.0.0.1",
      userEmail: email,
      timestamp: new Date().toISOString()
    }).catch(() => {});
  } catch (e) {}

  try {
    user.lastLogin = new Date();
    await user.save();
    
    await AuditLog.create({
      userId: user._id,
      email: user.email,
      action: "LOGIN_SUCCESS",
      ip,
      userAgent
    });
  } catch (err) {
    // ignore database write error
  }

  return {
    user: typeof user.toSafeObject === "function" ? user.toSafeObject() : user,
    accessToken,
    refreshToken
  };
};

const logout = async (userId, email, refreshToken, ip, userAgent) => {
  try {
    const payload = jwt.verifyRefreshToken(refreshToken);
    if (payload && payload.jti) {
      await redisClient.del(`jti:${payload.jti}`);
    }
  } catch (err) {
    // silent pass
  }

  const dbOffline = mongoose.connection.readyState !== 1;
  if (!dbOffline) {
    try {
      await AuditLog.create({
        userId,
        email,
        action: "LOGOUT",
        ip,
        userAgent
      });
    } catch (err) {}
  }
};

const resetPassword = async (email, oldPassword, newPassword) => {
  const dbOffline = mongoose.connection.readyState !== 1;
  if (dbOffline) {
    throw new ApiError(503, "Database is currently offline. Password reset unavailable.");
  }

  const User = require("./auth.model");
  const user = await User.findByEmail(email.toLowerCase());

  if (!user) {
    throw new ApiError(404, "User profile not found");
  }

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) {
    throw new ApiError(400, "Incorrect current password");
  }

  user.password = newPassword; // Mongoose middleware will encrypt
  await user.save();

  // Log SIEM Event for security auditing
  try {
    await ingestEvent({
      type: "password_reset",
      protocol: "HTTPS",
      srcPort: 443,
      destPort: 443,
      bytes: 180,
      duration: 0,
      requestCount: 1,
      sourceIP: "127.0.0.1",
      destIP: "127.0.0.1",
      userEmail: email,
      timestamp: new Date().toISOString()
    });

    await AuditLog.create({
      userId: user._id,
      email: user.email,
      action: "PASSWORD_RESET",
      ip: "127.0.0.1",
      userAgent: "SentinelX Console Engine",
      metadata: { status: "Success" }
    });
  } catch (err) {}
};

module.exports = {
  register,
  login,
  logout,
  resetPassword
};
