/**
 * @fileoverview Application entry point.
 * Loads environment variables, connects to the database,
 * and starts the Express server.
 */

require("dotenv").config();

const app = require("./src/app.js");
const connectToDB = require("./src/config/database.js");

/**
 * Initialize database connection
 * Exits the process if connection fails
 */
connectToDB()
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((err) => {
        console.error("Error in connecting DB:", err);
        process.exit(1);
    });

/**
 * Start Express server
 * Uses PORT from environment variables or defaults to 3000
 */
const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
    console.log(`Server is listening on PORT: ${PORT}`);
});