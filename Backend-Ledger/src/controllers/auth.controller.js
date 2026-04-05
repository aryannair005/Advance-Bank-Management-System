const userModel = require("../models/user.model.js")
const jwt = require("jsonwebtoken")
const emailService = require("../services/email.service.js")
const blacklistModel = require("../models/blackList.model.js")

const registerUserController = async(req,res) => {
    const { email, name , password} = req.body
    const isUserAlreadyExists = await userModel.findOne({email})

    if(isUserAlreadyExists){
        return res.status(422).json({
            message:"User already exist with given email"
        })
    }

    const user = await userModel.create({
        email:email,
        name:name,
        password:password
    })

    const token = jwt.sign({userId:user._id},process.env.JWT_SECRET)

    res.cookie("token",token)

    res.status(201).json({
        message:"User registered successfully",
        user:{
            _id:user._id,
            name:user.name,
            email:user.email
        },
        token
    })
    await emailService.sendRegistrationEmail(user.email,user.name)
}

const loginUserController = async (req,res) => {
    const { email , password } = req.body

    const user = await userModel.findOne({email}).select("+password")
    if(!user){
        return res.status(401).json({
            message:"User with given email doesn't exist",
        })
    }

    const isPasswordCorrect = await user.comparePassword(password)
        
    if(!isPasswordCorrect){
        return res.status(401).json({
            message:"Invalid Credentials"
        })
    }

    const token = jwt.sign({userId:user._id},process.env.JWT_SECRET)
    res.cookie("token",token)
    
    res.status(200).json({
        message:"User logged In successfully",
        user:{
            _id:user._id,
            name:user.name,
            email:user.email,
        },
        token
    })
    await emailService.sendLoginNotificationEmail(user.email,user.name)
}

const logoutUserController = async (req,res) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]
    const alreadyBlacklisted = await blacklistModel.findOne({token})
    
    if(alreadyBlacklisted){
        return res.status(400).json({
            message:"Token is already blacklisted"
        })
    }

    if(!token){
        return res.status(400).json({
            message:"No token provided"
        })
    }

    res.clearCookie("token")

    await blacklistModel.create({token})

    res.status(200).json({
        message:"User logged out successfully"
    })
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController
}