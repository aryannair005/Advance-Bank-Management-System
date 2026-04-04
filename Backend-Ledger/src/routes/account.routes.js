const express = require("express")
const accountRouter = express()
const authMiddleware = require("../middlewares/auth.middleware.js")
const accountController = require("../controllers/account.controller.js")


accountRouter.post("/",authMiddleware.authMiddleware,accountController.createAccount)

module.exports = accountRouter