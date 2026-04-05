const mongoose = require("mongoose")

const ledgerSchema = new mongoose.Schema({
    account:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true,"Ledger must be associated with an account."],
        index:true,
        immutable:true,
    },
    amount:{
        type:Number,
        required:[true,"Amount is required for creating a ledger entry."],
        immutable:true,
    },
    transaction:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"transaction",
        required:[true,"Ledger must be associated with a transaction"],
        index:true,
        immutable:true,
    },
    type:{
        type:String,
        enum:{
            values:["CREDIT","DEBIT"],
            message:"Type can be either CREDIT or DEBIT"
        },
        required:[true,"Type is required for creating a ledger entry."],
        immutable:true,
    }
})

function preventLedgerModification(){
    throw new Error("Ledger entries cannot be modified after creation.")
}

// Update operations
ledgerSchema.pre("findOneAndUpdate", preventLedgerModification);
ledgerSchema.pre("updateOne", preventLedgerModification);
ledgerSchema.pre("updateMany", preventLedgerModification);
ledgerSchema.pre("update", preventLedgerModification);

// Delete operations
ledgerSchema.pre("deleteOne", preventLedgerModification);
ledgerSchema.pre("deleteMany", preventLedgerModification);
ledgerSchema.pre("findOneAndDelete", preventLedgerModification);
ledgerSchema.pre("findOneAndRemove", preventLedgerModification);
ledgerSchema.pre("remove", preventLedgerModification);

// Replace operations
ledgerSchema.pre("findOneAndReplace", preventLedgerModification);
ledgerSchema.pre("replaceOne", preventLedgerModification);

const Ledger = mongoose.model("ledger", ledgerSchema)

module.exports = Ledger