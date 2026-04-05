const transactionModel = require("../models/transaction.model.js")
const accountModel = require("../models/account.model.js")
const mongoose = require("mongoose")
const ledgerModel = require("../models/ledger.model.js")
const emailService = require("../services/email.service.js")

// 1- Validate the request
// 2- Validate idempotency key
// 3- Check account status
// 4- Derive sender balance from ledger
// 5- Create transaction(PENDING)
// 6- Create DEBIT ledger entry for sender
// 7- Create CREDIT ledger entry for receiver
// 8- Mark transaction as Completed
// 9- Commit MongoDB session
// 10- Send email notification


const createTransactionController = async (req,res) => {
    // 1- Validate the request
    const {fromAccount,toAccount,amount,idempotencyKey} = req.body

    if(!fromAccount || !toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message:"Missing required fields: fromAccount, toAccount, amount, idempotencyKey"
        })
    }
    const fromUserAccount = await accountModel.findOne({_id:fromAccount})
    const toUserAccount = await accountModel.findOne({_id:toAccount})

    if(!fromUserAccount || !toUserAccount){
        return res.status(404).json({
            message:"One or both accounts not found."
        })
    }

    // 2- Validate idempotency key
    const existingTransaction = await transactionModel.findOne({idempotencyKey:idempotencyKey})

    if(existingTransaction){
        if(existingTransaction.status === "COMPLETED"){
            return res.status(200).json({
                message:"Transaction already processed.",
                transaction:existingTransaction
            })
        }
        if(existingTransaction.status === "PENDING"){
            return res.status(200).json({
                message:"Transaction is still being processed. Please wait.",
                transaction:existingTransaction
            })
        }
        if(existingTransaction.status === "FAILED"){
            return res.status(500).json({
                message:"Previous transaction attempt failed. You can retry.",
                transaction:existingTransaction
            })
        }
        if(existingTransaction.status === "REVERSED"){
            return res.status(500).json({
                message:"Previous transaction was reversed. You can retry.",
                transaction:existingTransaction
            })
        }
    }

    // 3- Check account status
    if(fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE"){
        return res.status(400).json({
            message:"One or both accounts are not active."
        })
    }

    // 4- Derive sender balance from ledger
    const balance = await fromUserAccount.getBalance()

    if(balance < amount){
        return res.status(400).json({
            message:`Insufficient balance. Current balance is ${balance}. Required balance is ${amount}.`
        })
    }

    let transaction;
    try{
        const session = await mongoose.startSession()
        session.startTransaction()

        transaction = (await transactionModel.create([{
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status:"PENDING"
        }],{session}))[0]

        const debitLedgerEntry = await ledgerModel.create([{
            account:fromAccount,
            transaction:transaction._id,
            type:"DEBIT",
            amount:amount,
        }],{session})

        await (()=>{
            return new Promise((resolve)=> setTimeout(resolve,10*1000))
        })()

        const creditLedgerEntry = await ledgerModel.create([{
            account:toAccount,
            transaction:transaction._id,
            type:"CREDIT",
            amount:amount,
        }],{session})


        await session.commitTransaction()
        session.endSession()

        await transactionModel.findByIdAndUpdate(
            transaction._id,
            { status: "COMPLETED" }
        )
    }catch(err){
        return res.status(500).json({
            message:"Transaction is Pending due to some issue. Please retry",
        })
    }
    await emailService.sendTransactionEmail(req .user.email,req.user.name,amount,toAccount)
    
    const updatedTransaction = await transactionModel.findById(transaction._id)

    return res.status(201).json({
        message:"Transaction completed successfully.",
        transaction: updatedTransaction
    })
}


const createInitialFundsController = async(req,res) => {
    const {toAccount,amount,idempotencyKey} = req.body

    if(!toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message:"Missing required fields: toAccount, amount, idempotencyKey"
        })
    }

    const toUserAccount = await accountModel.findOne({_id:toAccount})

    if(!toUserAccount){
        return res.status(404).json({
            message:"Account not found."
        })
    }

    const fromUserAccount = await accountModel.findOne({user:req.user._id})

    if(!fromUserAccount){
        return res.status(404).json({
            message:"System user account not found."
        })
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    const transaction = new transactionModel({
        fromAccount:fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status:"PENDING"
    })

    const debitLedgerEntry = await ledgerModel.create([{
        account:fromUserAccount._id,
        transaction:transaction._id,
        type:"DEBIT",
        amount:amount,
    }],{session})

    const creditLedgerEntry = await ledgerModel.create([{
        account:toAccount,
        transaction:transaction._id,
        type:"CREDIT",
        amount:amount,
    }],{session})

    transaction.status = "COMPLETED"
    await transaction.save({session})
    await session.commitTransaction()
    session.endSession()


    return res.status(201).json({
        message:"Initial funds added successfully.",
        transaction:transaction
    })
}

module.exports = {
    createTransactionController,
    createInitialFundsController 
}

// hackerchutiyehotehe_db_user
// Aryanna3557u