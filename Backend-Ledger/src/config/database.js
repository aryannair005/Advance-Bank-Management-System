/**
 * @fileoverview Database connection utility.
 * This module connects the application to MongoDB using Mongoose.
 */

const mongoose = require("mongoose");

/**
 * @function connectToDB
 * @description Establish a connection to MongoDB using the URI from environment variables
 */
const connectToDB = async () => {
    await mongoose.connect(process.env.MONGO_URI);
};

module.exports = connectToDB;