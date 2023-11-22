// authController.js
const userModel = require("../model/userSchema.js");
const emailValidator = require("email-validator");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const cloudinary = require('cloudinary');
const signUp = async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        if (password != confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and confirm password does not match"
            })
        }

        if (!emailValidator.validate(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email"
            })
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists, please go and sign in"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userInfo = await userModel.create({
            name,
            email,
            password: hashedPassword,
            image: {
                public_id: "dummy",
                secure_url: "dummy",
            }
        });

        if (req.file) {
            console.log(req.file);
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path, { folder: 'lms' });
                if (result) {
                    userModel.image = userModel.image || {};
                    userModel.image.public_id = result.public_id;
                    userModel.image.secure_url = result.secure_url;

                    console.log(userModel.image.public_id);
                    console.log(userModel.image.secure_url);
                    // remove the file from local machine(server)
                }
            } catch (e) {
                console.log("Error uploading to Cloudinary due to", e.message) ;
                return res.status(400).json({
                    success:false,
                    message: "Error uploading image to cloudinary"
                })
            }
        }

        // userInfo.password = undefined;

        await userInfo.save();


        const token = jwt.sign(
            {
                id: userInfo._id  //payload bro
            },
            process.env.SECRET,
            {
                expiresIn: "24h" // Token will expire in 24 hours
            }
        );



        const cookieOption = {
            maxAge: 24 * 60 * 60 * 1000, //24ghante
            httpOnly: true //  not able to modify  the cookie on client side
        };

        res.cookie("token", token, cookieOption);


        return res.status(200).json({
            success: true,
            message: `User ${name} has been created successfully`,
            userDetails: userInfo,
            Token: token
        })

    } catch (err) {
        console.log(err.message);
        return res.status(400).json({
            success: false,
            message: "Unable to sign up new users right now",
            error: err.message
        })
    }
}

const signIn = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "email and password are required"
        });
    }

    try {
        const user = await userModel.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({
                success: false,
                message: "invalid credentials"
            });
        }

        const token = jwt.sign(
            {
                id: user._id  //payload bro
            },
            process.env.SECRET,
            {
                expiresIn: "24h" // Token will expire in 24 hours
            }
        );
        user.password = undefined;
        const cookieOption = {
            maxAge: 24 * 60 * 60 * 1000, //24ghante
            httpOnly: true //  not able to modify  the cookie on client side
        };

        res.cookie("token", token, cookieOption).status(200).json({
            success: true,
            data: user
        });    //"token" => cookie ka naam
        //token => cookie k andr ka data
        //cookieoption => y toh smjh aa hi rha hoga
        // Basically cookie k andr 1 field hogi token naam ki us k andr apna token pda hoga kuch options k sath
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getUser = async (req, res) => {
    const userId = req.user.id;
    try {
        const user = await userModel.findById(userId);
        user.password = undefined;
        return res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

const forgotPassword = async (req, res) => {
    const email = req.body.email;

    // return response with error message If email is undefined
    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Email is required"
        });
    }

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "user not found 🙅"
            });
        }

        const forgotPasswordToken = user.getForgotPasswordToken();

        await user.save();

        // IS K BAAD HUM TOKEN USER KO MAIL KR SKTE HAI THROUGH SMTP SERVER JIS K LIYE PAISE LGTE HAI 
        // BUT 1 FAKE SERVER K THROUGH HUM MAIL KR SKTE HAIN JISKA NAAM HAI ETHEREAL

        // BERY BERY EASY TO SEND EMAIL THROUGH ETHEREAL

        return res.status(200).json({
            success: true,
            token: forgotPasswordToken
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


const resetPassword = async (req, res) => {
    const token = req.params.token;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "password and confirmPassword is required"
        });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "password and confirm Password does not match ❌"
        });
    }

    const hashToken = crypto.createHash("sha256").update(token).digest("hex");
    // console.log(hashToken);

    try {
        const user = await userModel.findOne({
            forgotPasswordToken: hashToken,
            forgotPasswordExpiryDate: {
                $gt: new Date() // forgotPasswordExpiryDate() less the current date
            }
        });

        // return the message if user not found
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid Token or token is expired"
            });
        }

        user.password = password;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "successfully reset the password"
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const logout = async (req, res) => {
    try {

        // return response with cookie without token
        res.cookie("token", null);
        res.status(200).json({
            success: true,
            message: "Logged Out"
        });
    } catch (error) {
        res.stats(400).json({
            success: false,
            message: error.message
        });
    }
};
module.exports = { signUp, signIn, getUser, forgotPassword, resetPassword, logout };













