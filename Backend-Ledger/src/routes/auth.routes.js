const express = require("express")
const authRouter = express.Router()
const authController = require("../controllers/auth.controller.js")

authRouter.post("/login",authController.loginUserController)
authRouter.post("/register",authController.registerUserController)

module.exports = authRouter