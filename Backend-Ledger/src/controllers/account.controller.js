const accountModel = require("../models/account.model.js")

const createAccount = async(req,res) => {
    const user = req.user

    const account = await accountModel.create({
        user:user._id,
    })

    return res.status(201).json({
        message:"Account created successfully",
        account,
    })
}

const getAllAccounts = async(req,res) => {
    const user = req.user

    const accounts = await accountModel.find({user:user._id})

    return res.status(200).json({
        message:"Accounts fetched successfully",
        accounts,
    })
}

const getAccountBalance = async(req,res) => {
    const user = req.user
    const {accountId} = req.params

    const account = await accountModel.findOne({_id:accountId,user:user._id})
    if(!account){
        return res.status(404).json({
            message:"Account not found",
        })
    }

    const balance = await account.getBalance()
    return res.status(200).json({
        message:"Account balance fetched successfully",
        balance,
    }) 
}

module.exports = {
    createAccount,
    getAllAccounts,
    getAccountBalance,
}