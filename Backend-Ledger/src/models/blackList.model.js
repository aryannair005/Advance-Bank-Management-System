/**
 * @fileoverview Mongoose model for token blacklist.
 * Stores invalidated JWT tokens (e.g., after logout) to prevent reuse.
 * Includes automatic expiration using TTL index.
 */

const mongoose = require("mongoose");
/**
 * Blacklist schema definition
 */
const blackListSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            required: [true, "token is required"],
            unique: [true, "token must be unique"],
        },
    },
    {
        timestamps: true,
    }
);

/**
 * TTL (Time-To-Live) index
 * Automatically deletes documents after 3 days (in seconds)
 * Helps prevent database from growing indefinitely
 */
blackListSchema.index(
    { createdAt: 1 },
    {
        expireAfterSeconds: 60 * 60 * 24 * 3, // 3 days
    }
);

/**
 * Blacklist model
 */
const blackListModel = mongoose.model("blackList", blackListSchema);

module.exports = blackListModel;