/**
 * @fileoverview Controller for account-related operations.
 * Handles creating accounts, fetching user accounts,
 * and retrieving account balance.
 */

const accountModel = require("../models/account.model.js");

/**
 * @function createAccount
 * @description Create a new account for the authenticated user
 * @route POST /api/account/
 * @access Private
 */
const createAccount = async (req, res) => {
    const user = req.user;

    const account = await accountModel.create({
        user: user._id,
    });

    return res.status(201).json({
        message: "Account created successfully",
        account,
    });
};

/**
 * @function getAllAccounts
 * @description Retrieve all accounts belonging to the authenticated user
 * @route GET /api/account/
 * @access Private
 */
const getAllAccounts = async (req, res) => {
    const user = req.user;

    const accounts = await accountModel.find({ user: user._id });

    return res.status(200).json({
        message: "Accounts fetched successfully",
        accounts,
    });
};

/**
 * @function getAccountBalance
 * @description Retrieve the balance of a specific account
 * @route GET /api/account/balance/:accountId
 * @access Private
 */
const getAccountBalance = async (req, res) => {
    const user = req.user;
    const { accountId } = req.params;

    const account = await accountModel.findOne({
        _id: accountId,
        user: user._id,
    });

    if (!account) {
        return res.status(404).json({
            message: "Account not found",
        });
    }

    const balance = await account.getBalance();

    return res.status(200).json({
        message: "Account balance fetched successfully",
        balance,
    });
};

module.exports = {
    createAccount,
    getAllAccounts,
    getAccountBalance,
};