/**
 * @fileoverview Authentication and authorization middleware.
 * This module provides middleware to:
 * - Verify JWT tokens
 * - Check blacklisted tokens
 * - Attach authenticated user to request
 * - Restrict access to system/admin users
 */

const userModel = require("../models/user.model.js");
const jwt = require("jsonwebtoken");
const blackListModel = require("../models/blackList.model.js");

/**
 * @function authMiddleware
 * @description Middleware to authenticate users using JWT.
 * Verifies token, checks blacklist, and attaches user to request object.
 *
 * @access Protected (All authenticated users)
 */
const authMiddleware = async (req, res, next) => {
    // Extract token from cookies or Authorization header
    const token =
        req.cookies.token ||
        req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized access, token is missing."
        });
    }

    // Check if token is blacklisted
    const blacklistedToken = await blackListModel.findOne({ token });

    if (blacklistedToken) {
        return res.status(401).json({
            message: "Unauthorized access, token is blacklisted."
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch user from DB
        const user = await userModel.findById(decoded.userId);

        // Attach user to request
        req.user = user;

        return next();
    } catch (err) {
        return res.status(401).json({
            message: "Unauthorized access, token is invalid."
        });
    }
};

/**
 * @function authSystemUserMiddleware
 * @description Middleware to authenticate and authorize system/admin users.
 * Ensures user has elevated privileges (`systemUser = true`).
 *
 * @access Restricted (System/Admin users only)
 */
const authSystemUserMiddleware = async (req, res, next) => {
    // Extract token
    const token =
        req.cookies.token ||
        req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized access, token is missing."
        });
    }

    // Check blacklist
    const blacklistedToken = await blackListModel.findOne({ token });

    if (blacklistedToken) {
        return res.status(401).json({
            message: "Unauthorized access, token is blacklisted."
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch user with systemUser field
        const user = await userModel
            .findById(decoded.userId)
            .select("+systemUser");

        // Check if user is system/admin
        if (!user.systemUser) {
            return res.status(403).json({
                message: "Forbidden access, user is not a system user."
            });
        }

        // Attach user to request
        req.user = user;

        return next();
    } catch (err) {
        return res.status(401).json({
            message: "Unauthorized access, token is invalid."
        });
    }
};

module.exports = {
    authMiddleware,
    authSystemUserMiddleware
};