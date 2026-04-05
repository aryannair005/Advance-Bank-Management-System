const express = require("express")
const accountRouter = express.Router()
const authMiddleware = require("../middlewares/auth.middleware.js")
const accountController = require("../controllers/account.controller.js")

// Create Account
accountRouter.post("/",authMiddleware.authMiddleware,accountController.createAccount)

// Get All Accounts of logged in user
accountRouter.get("/",authMiddleware.authMiddleware,accountController.getAllAccounts) 

// Get balance of an account
accountRouter.get("/balance/:accountId",authMiddleware.authMiddleware,accountController.getAccountBalance)  

module.exports = accountRouter