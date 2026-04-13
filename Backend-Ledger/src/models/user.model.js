/**
 * @fileoverview Mongoose model for User.
 * Handles user authentication data, password hashing,
 * and password comparison utilities.
 */

const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");


/**
 * User schema definition
 */
const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, "Email is requried for creating an user"],
            trim: true,
            lowercase: true,
            unique: true,
            match: [
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                "Invalid email format"
            ]
        },
        name: {
            type: String,
            required: [true, "Name is required for creating an user"],
        },
        password: {
            type: String,
            required: [true, "Password is required for creating an user"],
            minlength: [6, "Password must contain more than 6 characters"],
            select: false, // Exclude password from query results by default
        },
        systemUser: {
            type: Boolean,
            default: false,
            immutable: true,
            select: false, // Hidden unless explicitly selected
        }
    },
    {
        timestamps: true,
    }
);


userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    const hashedPassword = await bcryptjs.hash(this.password, 10);
    this.password = hashedPassword;
});


userSchema.methods.comparePassword = async function (password) {
    return await bcryptjs.compare(password, this.password);
};

/**
 * User model
 */
const userModel = mongoose.model("user", userSchema);


module.exports = userModel;