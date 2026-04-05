const mongoose = require("mongoose")
const bcryptjs = require("bcryptjs")

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:[true,"Email is requried for creating an user"],
        trim:true,
        lowercase:true,
        unique:true,
        match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,"Invalid email format"]
    },
    name:{
        type:String,
        required:[true,"Name is required for creating an user"],
    },
    password:{
        type:String,
        required:[true,"Password is required for creating an user"],
        minlength:[6,"Password must contain more than 6 characters"],
        select:false
    },
    systemUser:{
        type:Boolean,
        default:false,
        immutable:true,
        select:false,
    }
},{
    timestamps:true
})

userSchema.pre("save",async function(){
    if(!this.isModified("password")){
        return
    }

    const hashedPassword = await bcryptjs.hash(this.password,10)
    this.password=hashedPassword
    return
})

userSchema.methods.comparePassword = async function(password){  
    return await bcryptjs.compare(password,this.password)
}

const userModel = mongoose.model("user",userSchema)

module.exports = userModel