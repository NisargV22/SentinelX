const authService = require("./auth.service");
const ApiError = require("../../utils/ApiError");

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"];
    
    const result = await authService.login(email, password, ip, userAgent);
    
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    res.json({
      success: true,
      user: result.user,
      accessToken: result.accessToken
    });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"];
    
    if (req.user) {
      await authService.logout(req.user.id, req.user.email, refreshToken, ip, userAgent);
    }
    
    res.clearCookie("refreshToken", { path: "/api/auth" });
    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Not authenticated");
    }
    res.json({ success: true, user: req.user });
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    await authService.resetPassword(req.user.email, oldPassword, newPassword);
    res.json({ success: true, message: "Password updated successfully." });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  resetPassword
};
