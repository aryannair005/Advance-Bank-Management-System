const accountModel = require("../models/account.model.js")


const createAccount = async(req,res,next) => {
    const user = req.user

    const account = await accountModel.create({
        user:user._id,
    })

    return res.status(201).json({
        message:"Account created successfully",
        account,
    })
}


module.exports = {
    createAccount
}