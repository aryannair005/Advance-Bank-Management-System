/**
 * @fileoverview Routes for user authentication.
 * This module handles login, registration, and logout functionality.
 */

const express = require("express");
const authRouter = express.Router();

const authController = require("../controllers/auth.controller.js");

/**
 * @route POST /api/auth/login
 * @description Authenticate user and log them into the system
 * @access Public
 */
authRouter.post("/login", authController.loginUserController);

/**
 * @route POST /api/auth/register
 * @description Register a new user in the system
 * @access Public
 */
authRouter.post("/register", authController.registerUserController);

/**
 * @route POST /api/auth/logout
 * @description Log out the currently authenticated user
 * @access Public (or Private depending on implementation)
 */
authRouter.post("/logout", authController.logoutUserController);

module.exports = authRouter;