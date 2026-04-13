/**
 * @fileoverview Mongoose model for Account.
 * Represents a user's bank account and provides utility methods
 * such as calculating account balance from ledger entries.
 */

const mongoose = require("mongoose");
const ledgerModel = require("./ledger.model.js");

/**
 * Account schema definition
 */
const accountSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: [true, "Account must be associated with user."],
            index: true,
        },
        status: {
            type: String,
            enum: {
                values: ["ACTIVE", "CLOSED", "FROZEN"],
                message: "Status can be either ACTIVE, FROZEN or CLOSED",
            },
            default: "ACTIVE",
        },
        currency: {
            type: String,
            required: [true, "Currency is required for creating an account."],
            default: "INR",
        },
    },
    {
        timestamps: true,
    }
);

/**
 * Compound index for faster queries on user + status
 */
accountSchema.index({ user: 1, status: 1 });

/**
 * @method getBalance
 * @description Calculate the current account balance using ledger entries.
 * Balance = Total Credits - Total Debits
 */
accountSchema.methods.getBalance = async function () {
    const balanceData = await ledgerModel.aggregate([
        {
            $match: { account: this._id }
        },
        {
            $group: {
                _id: null,
                totalDebit: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", "DEBIT"] },
                            "$amount",
                            0
                        ]
                    }
                },
                totalCredit: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", "CREDIT"] },
                            "$amount",
                            0
                        ]
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                balance: {
                    $subtract: ["$totalCredit", "$totalDebit"]
                }
            }
        }
    ]);

    // If no transactions exist, balance is 0
    if (balanceData.length === 0) {
        return 0;
    }

    return balanceData[0].balance;
};

/**
 * Account model
 */

const accountModel = mongoose.model("account", accountSchema);

module.exports = accountModel;