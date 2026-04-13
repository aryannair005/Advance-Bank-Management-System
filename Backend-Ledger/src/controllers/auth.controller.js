/**
 * @fileoverview Controller for user authentication.
 * Handles user registration, login, and logout operations.
 */

const userModel = require("../models/user.model.js");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.service.js");
const blacklistModel = require("../models/blackList.model.js");

/**
 * @function registerUserController
 * @description Register a new user, generate JWT token, and send welcome email
 * @route POST /api/auth/register
 * @access Public
 */
const registerUserController = async (req, res) => {
    const { email, name, password } = req.body;

    const isUserAlreadyExists = await userModel.findOne({ email });

    if (isUserAlreadyExists) {
        return res.status(422).json({
            message: "User already exist with given email"
        });
    }

    const user = await userModel.create({
        email: email,
        name: name,
        password: password
    });

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    // Store token in cookies
    res.cookie("token", token);

    res.status(201).json({
        message: "User registered successfully",
        user: {
            _id: user._id,
            name: user.name,
            email: user.email
        },
        token
    });

    // Send registration email (async, non-blocking)
    await emailService.sendRegistrationEmail(user.email, user.name);
};

/**
 * @function loginUserController
 * @description Authenticate user, generate JWT token, and send login notification
 * @route POST /api/auth/login
 * @access Public
 */
const loginUserController = async (req, res) => {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
        return res.status(401).json({
            message: "User with given email doesn't exist",
        });
    }

    // Validate password
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
        return res.status(401).json({
            message: "Invalid Credentials"
        });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    // Store token in cookies
    res.cookie("token", token);

    res.status(200).json({
        message: "User logged In successfully",
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
        },
        token
    });

    // Send login notification email
    await emailService.sendLoginNotificationEmail(user.email, user.name);
};

/**
 * @function logoutUserController
 * @description Logout user by clearing token and blacklisting it
 * @route POST /api/auth/logout
 * @access Public/Private (depends on implementation)
 */
const logoutUserController = async (req, res) => {
    // Extract token from cookie or Authorization header
    const token =
        req.cookies.token ||
        req.headers.authorization?.split(" ")[1];

    const alreadyBlacklisted = await blacklistModel.findOne({ token });

    if (alreadyBlacklisted) {
        return res.status(400).json({
            message: "Token is already blacklisted"
        });
    }

    if (!token) {
        return res.status(400).json({
            message: "No token provided"
        });
    }

    // Clear token cookie
    res.clearCookie("token");

    // Add token to blacklist
    await blacklistModel.create({ token });

    res.status(200).json({
        message: "User logged out successfully"
    });
};

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController
};