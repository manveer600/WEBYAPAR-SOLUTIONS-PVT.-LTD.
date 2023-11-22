// authRoute.js
const uploads = require('../middleware/multer.js');

const express = require("express");
const authRouter = express.Router();
const {signUp,signIn,getUser,forgotPassword,resetPassword, logout} = require("../controller/authController.js");
const isLoggedIn = require("../middleware/jwtAuth.js");
authRouter.post("/signup", uploads.single('image'),signUp);
authRouter.post("/signin", signIn);
authRouter.post("/forgotpassword", forgotPassword);
authRouter.post("/resetpassword/:token", resetPassword);

authRouter.get("/user", isLoggedIn, getUser);
authRouter.get('/logout', isLoggedIn , logout)


module.exports = authRouter;

