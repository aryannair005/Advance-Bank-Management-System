const express = require("express")
const app = express()
const cookieParser = require("cookie-parser")

const authRouter = require("./routes/auth.routes.js")
const accountRouter = require("./routes/account.routes.js")
const transactionRouter = require("./routes/transaction.routes.js")

app.use(express.json())
app.use(cookieParser())

app.use("/api/auth",authRouter)
app.use("/api/account",accountRouter)
app.use("/api/transaction",transactionRouter)



module.exports = app