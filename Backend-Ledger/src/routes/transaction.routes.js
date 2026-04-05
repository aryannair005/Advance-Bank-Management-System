const express = require('express');
const transactionRouter = express.Router();
const transactionController = require("../controllers/transaction.controller.js")
const authMiddleware = require("../middlewares/auth.middleware.js")

transactionRouter.post("/",authMiddleware.authMiddleware,transactionController.createTransactionController)

module.exports = transactionRouter;