/**
 * @fileoverview Routes for transaction-related operations.
 * This module handles creating transactions and initializing system funds.
 */

const express = require('express');
const transactionRouter = express.Router();

const transactionController = require("../controllers/transaction.controller.js");
const authMiddleware = require("../middlewares/auth.middleware.js");

/**
 * @route POST /api/transaction/
 * @description Create a new transaction (e.g., transfer funds between accounts)
 * @access Private (requires authentication)
 */
transactionRouter.post(
    "/",
    authMiddleware.authMiddleware,
    transactionController.createTransactionController
);

/**
 * @route POST /api/transaction/system/initial-funds
 * @description Initialize funds in the system (typically for setup or admin use)
 * @access Restricted (system/admin only)
 */
transactionRouter.post(
    "/system/initial-funds",
    authMiddleware.authSystemUserMiddleware,
    transactionController.createInitialFundsController
);

module.exports = transactionRouter;