const express = require("express");
const authController = require("./auth.controller");
const { validate, registerSchema, loginSchema } = require("../../middleware/validate");
const { loginLimiter, registerLimiter } = require("../../middleware/rateLimiter");
const { auth } = require("../../middleware/auth");

const router = express.Router();

router.post("/register", registerLimiter, validate(registerSchema), authController.register);
router.post("/login", loginLimiter, validate(loginSchema), authController.login);
router.post("/logout", auth, authController.logout);
router.get("/me", auth, authController.getMe);
router.post("/reset-password", auth, authController.resetPassword);

module.exports = router;
