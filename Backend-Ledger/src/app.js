/**
 * @fileoverview Main application entry point for the Bank Ledger API.
 * This file sets up middleware, routes, and exports the Express app instance.
 */

const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");

/**
 * Import route modules
 * @module authRouter - Handles authentication-related routes
 * @module accountRouter - Handles account-related operations
 * @module transactionRouter - Handles transaction-related operations
 */
const authRouter = require("./routes/auth.routes.js");
const accountRouter = require("./routes/account.routes.js");
const transactionRouter = require("./routes/transaction.routes.js");

/**
 * Middleware setup
 * - express.json(): Parses incoming JSON requests
 * - cookieParser(): Parses cookies attached to the client request
 */
app.use(express.json());
app.use(cookieParser());

/**
 * @route GET /
 * @description Health check / Welcome route for the API
 * @access Public
 * @returns {Object} JSON response with welcome message
 */
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to Bank Ledger API"
    });
});

/**
 * Mount route handlers
 * All routes are prefixed with their respective base paths
 *
 * @route /api/auth - Authentication routes
 * @route /api/account - Account management routes
 * @route /api/transaction - Transaction routes
 */
app.use("/api/auth", authRouter);
app.use("/api/account", accountRouter);
app.use("/api/transaction", transactionRouter);


module.exports = app;