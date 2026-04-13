/**
 * @fileoverview Controller for transaction-related operations.
 * Handles fund transfers between accounts and system-based initial funding.
 * Includes idempotency handling and MongoDB transaction sessions.
 */

const transactionModel = require("../models/transaction.model.js");
const accountModel = require("../models/account.model.js");
const mongoose = require("mongoose");
const ledgerModel = require("../models/ledger.model.js");
const emailService = require("../services/email.service.js");

/**
 * @description Create a new transaction between two accounts with idempotency support.
 * Ensures atomicity using MongoDB transactions and updates ledger entries.
 *
 * Flow:
 * 1. Validate request
 * 2. Validate idempotency key
 * 3. Check account status
 * 4. Verify sufficient balance
 * 5. Create transaction (PENDING)
 * 6. Create DEBIT & CREDIT ledger entries
 * 7. Mark transaction COMPLETED
 * 8. Send email notification
 *
 * @route POST /api/transaction/
 * @access Private

 */
const createTransactionController = async (req, res) => {
    // 1. Validate request
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "Missing required fields: fromAccount, toAccount, amount, idempotencyKey"
        });
    }

    const fromUserAccount = await accountModel.findOne({ _id: fromAccount });
    const toUserAccount = await accountModel.findOne({ _id: toAccount });

    if (!fromUserAccount || !toUserAccount) {
        return res.status(404).json({
            message: "One or both accounts not found."
        });
    }

    // 2. Idempotency check
    const existingTransaction = await transactionModel.findOne({ idempotencyKey });

    if (existingTransaction) {
        if (existingTransaction.status === "COMPLETED") {
            return res.status(200).json({
                message: "Transaction already processed.",
                transaction: existingTransaction
            });
        }
        if (existingTransaction.status === "PENDING") {
            return res.status(200).json({
                message: "Transaction is still being processed. Please wait.",
                transaction: existingTransaction
            });
        }
        if (existingTransaction.status === "FAILED" || existingTransaction.status === "REVERSED") {
            return res.status(500).json({
                message: "Previous transaction failed or reversed. You can retry.",
                transaction: existingTransaction
            });
        }
    }

    // 3. Check account status
    if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
        return res.status(400).json({
            message: "One or both accounts are not active."
        });
    }

    // 4. Check balance
    const balance = await fromUserAccount.getBalance();

    if (balance < amount) {
        return res.status(400).json({
            message: `Insufficient balance. Current balance is ${balance}. Required balance is ${amount}.`
        });
    }

    let transaction;

    try {
        /**
         * Start MongoDB session for atomic transaction
         */
        const session = await mongoose.startSession();
        session.startTransaction();

        // 5. Create transaction (PENDING)
        transaction = (await transactionModel.create([{
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        }], { session }))[0];

        // 6. Debit sender account
        await ledgerModel.create([{
            account: fromAccount,
            transaction: transaction._id,
            type: "DEBIT",
            amount: amount,
        }], { session });

        /**
         * Simulated delay (for testing concurrency / race conditions)
         */
        await new Promise(resolve => setTimeout(resolve, 10 * 1000));

        // 7. Credit receiver account
        await ledgerModel.create([{
            account: toAccount,
            transaction: transaction._id,
            type: "CREDIT",
            amount: amount,
        }], { session });

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        // Mark transaction completed
        await transactionModel.findByIdAndUpdate(
            transaction._id,
            { status: "COMPLETED" }
        );

    } catch (err) {
        return res.status(500).json({
            message: "Transaction is pending due to an issue. Please retry",
        });
    }

    // Send notification email
    await emailService.sendTransactionEmail(
        req.user.email,
        req.user.name,
        amount,
        toAccount
    );

    const updatedTransaction = await transactionModel.findById(transaction._id);

    return res.status(201).json({
        message: "Transaction completed successfully.",
        transaction: updatedTransaction
    });
};

/**
 * @function createInitialFundsController
 * @description Add initial/system funds to a user account.
 * Typically used by admin/system users.
 *
 * @route POST /api/transaction/system/initial-funds
 * @access Restricted (system/admin)
 */
const createInitialFundsController = async (req, res) => {
    const { toAccount, amount, idempotencyKey } = req.body;

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "Missing required fields: toAccount, amount, idempotencyKey"
        });
    }

    const toUserAccount = await accountModel.findOne({ _id: toAccount });

    if (!toUserAccount) {
        return res.status(404).json({
            message: "Account not found."
        });
    }

    const fromUserAccount = await accountModel.findOne({ user: req.user._id });

    if (!fromUserAccount) {
        return res.status(404).json({
            message: "System user account not found."
        });
    }

    /**
     * Start MongoDB session for atomic transaction
     */
    const session = await mongoose.startSession();
    session.startTransaction();

    const transaction = new transactionModel({
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    });

    // Debit system account
    await ledgerModel.create([{
        account: fromUserAccount._id,
        transaction: transaction._id,
        type: "DEBIT",
        amount: amount,
    }], { session });

    // Credit user account
    await ledgerModel.create([{
        account: toAccount,
        transaction: transaction._id,
        type: "CREDIT",
        amount: amount,
    }], { session });

    transaction.status = "COMPLETED";
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
        message: "Initial funds added successfully.",
        transaction: transaction
    });
};

module.exports = {
    createTransactionController,
    createInitialFundsController
};