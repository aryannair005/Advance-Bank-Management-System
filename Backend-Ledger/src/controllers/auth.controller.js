const userModel = require("../models/user.model.js")
const jwt = require("jsonwebtoken")
const emailService = require("../services/email.service.js")

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

    return res.status(200).json({
        message:"User logged In successfully",
        user:{
            _id:user._id,
            name:user.name,
            email:user.email,
        },
        token
    })
}

module.exports = {
    registerUserController,
    loginUserController
}