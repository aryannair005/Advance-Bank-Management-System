/**
 * @fileoverview Routes for account-related operations.
 * This module defines endpoints for creating accounts,
 * retrieving user accounts, and checking account balances.
 */

const express = require("express");
const accountRouter = express.Router();

const authMiddleware = require("../middlewares/auth.middleware.js");
const accountController = require("../controllers/account.controller.js");

/**
 * @middleware authMiddleware.authMiddleware
 * Ensures that the user is authenticated before accessing protected routes.
 */

/**
 * @route POST /api/account/
 * @description Create a new account for the logged-in user
 * @access Private (requires authentication)
 */
accountRouter.post(
    "/",
    authMiddleware.authMiddleware,
    accountController.createAccount
);

/**
 * @route GET /api/account/
 * @description Get all accounts belonging to the logged-in user
 * @access Private (requires authentication)
 */
accountRouter.get(
    "/",
    authMiddleware.authMiddleware,
    accountController.getAllAccounts
);

/**
 * @route GET /api/account/balance/:accountId
 * @description Get the balance of a specific account
 * @access Private (requires authentication)
 */
accountRouter.get(
    "/balance/:accountId",
    authMiddleware.authMiddleware,
    accountController.getAccountBalance
);

module.exports = accountRouter;