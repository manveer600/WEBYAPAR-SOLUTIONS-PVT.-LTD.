// userSchema.js
const mongoose = require("mongoose");
const JWT = require('jsonwebtoken');
const bcrypt = require("jsonwebtoken");
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: [true, 'user name is Required'],
        minLength: [5, 'Name must be at least 5 characters'],
        maxLength: [50, 'Name must be less than 50 characters'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'user email is required'],
        unique: true,
        lowercase: true,
        unique: [true, 'already registered'],
    },
    password: {
        type: String
    },
    image:{
        secure_url:{
            type:"String",
        },
        public_id:{
            type:"String"
        }
    },
    forgotPasswordToken: {
        type: String,
    },
    forgotPasswordExpiryDate: {
        type: Date,
    },
},
    { timestamps: true }
);

userSchema.methods = {
    getForgotPasswordToken() {
        const forgotToken = crypto.randomBytes(20).toString('hex');
        this.forgotPasswordToken = crypto
          .createHash('sha256')
          .update(forgotToken)
          .digest('hex');

        this.forgotPasswordExpiryDate = Date.now() + 20 * 60 * 1000; // 20min
    
        return forgotToken;
      },
}

const userModel = mongoose.model("Manveer",userSchema);
module.exports = userModel;




