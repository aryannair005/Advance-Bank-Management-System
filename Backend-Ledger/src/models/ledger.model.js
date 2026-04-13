/**
 * @fileoverview Mongoose model for Ledger.
 * Represents immutable financial records (debits and credits)
 * associated with transactions and accounts.
 *
 * IMPORTANT:
 * Ledger entries are immutable and cannot be modified or deleted
 * once created. This ensures financial data integrity.
 */

const mongoose = require("mongoose");

/**
 * Ledger schema definition
 */
const ledgerSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "Ledger must be associated with an account."],
        index: true,
        immutable: true,
    },
    amount: {
        type: Number,
        required: [true, "Amount is required for creating a ledger entry."],
        immutable: true,
    },
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "transaction",
        required: [true, "Ledger must be associated with a transaction"],
        index: true,
        immutable: true,
    },
    type: {
        type: String,
        enum: {
            values: ["CREDIT", "DEBIT"],
            message: "Type can be either CREDIT or DEBIT",
        },
        required: [true, "Type is required for creating a ledger entry."],
        immutable: true,
    },
});

/**
 * @function preventLedgerModification
 * @description Prevents any update, delete, or replace operations
 * on ledger entries to maintain immutability.
 */
function preventLedgerModification() {
    throw new Error("Ledger entries cannot be modified after creation.");
}

/**
 * Middleware to block all update operations
 */
ledgerSchema.pre("findOneAndUpdate", preventLedgerModification);
ledgerSchema.pre("updateOne", preventLedgerModification);
ledgerSchema.pre("updateMany", preventLedgerModification);
ledgerSchema.pre("update", preventLedgerModification);

/**
 * Middleware to block all delete operations
 */
ledgerSchema.pre("deleteOne", preventLedgerModification);
ledgerSchema.pre("deleteMany", preventLedgerModification);
ledgerSchema.pre("findOneAndDelete", preventLedgerModification);
ledgerSchema.pre("findOneAndRemove", preventLedgerModification);
ledgerSchema.pre("remove", preventLedgerModification);

/**
 * Middleware to block replace operations
 */
ledgerSchema.pre("findOneAndReplace", preventLedgerModification);
ledgerSchema.pre("replaceOne", preventLedgerModification);


/**
 * Ledger model
 */
const Ledger = mongoose.model("ledger", ledgerSchema);

module.exports = Ledger;