const mongoose = require("mongoose")

const blackListSchema = new mongoose.Schema({
    token:{
        type:String,
        required:[true,"token is required"],
        unique:[true,"token must be unique"],
    }
},{
    timestamps:true
})

blackListSchema.index({createdAt:1},{
    expireAfterSeconds:60*60*24*3
})

const blackListModel = mongoose.model("blackList",blackListSchema)

module.exports = blackListModel
