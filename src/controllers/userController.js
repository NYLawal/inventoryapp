const { MailNotSentError, BadUserRequestError, NotFoundError, UnAuthorizedError } =
require('../middleware/errors')
const crypto = require('crypto');
const User = require("../models/userModel");
const Token = require('../models/tokenModel')

const {
    userSignUpValidator,
    userLogInValidator,
    forgotPasswordValidator,
    resetPasswordValidator,
} = require("../validators/userValidator");
// const {SENDMAIL, GETMAIL} = require('../utils/mailHandler');


const userSignUp = async (req, res, next) => {
    const { error } = userSignUpValidator(req.body);
    if (error) throw error

    const user = await User.findOne({ email: req.body.email });
    if (user) throw new BadUserRequestError("Error: an account with this email already exists");

    const newUser = await User.create(req.body);
    const token = newUser.generateToken()
    res.header('token', token).status(201).json({
        status: "Success",
        message: "User created successfully",
        newUser
    });
}


const userLogIn = async (req, res, next) => {
    const { error } = userLogInValidator(req.body);
    if (error) throw error

    const user = await User.findOne({ email: req.body.email });
    if (!user) throw new UnAuthorizedError("Error: invalid email or password");

    const isValidPassword = await user.comparePassword(req.body.password)
    if (!isValidPassword) throw new UnAuthorizedError("Error: invalid email or password");

    const access_token = user.generateToken()
    res.header('access_token', access_token).status(200).json({
        status: "Success",
        message: "Successfully logged in",
        user,
        access_token: access_token
    });
}


const forgotPassword = async (req, res) => {
    const { error } = forgotPasswordValidator(req.body);
    if (error) throw error

    const user = await User.findOne({ email: req.body.email });
    if (!user) throw new BadUserRequestError("Error: invalid email!");
    let token = await Token.findOne({ userId: user._id });
    if (!token) {
        token = await new Token({
            userId: user._id,
            token: crypto.randomBytes(32).toString("hex"),
        }).save();
    }
    const link = `${process.env.RESET_PASSWORD_PAGE}?userId=${user._id}&token=${token.token}`;
    await SENDMAIL(user.email, "Password Reset", link);

    res.status(200).send("Password reset link has been sent to your email account");
}


const resetPassword = async (req, res) => {
    const { error } = resetPasswordValidator(req.body);
    if (error) throw error

    const user = await User.findById(req.params.userId);
    console.log(req.params.userId);
    if (!user) return res.status(400).send("Invalid link");

    const token = await Token.findOne({
        userId: user._id,
        token: req.params.token,
    });
    if (!token) return res.status(400).send("Invalid link or expired");

    user.password = req.body.password;
    await user.save();
    await token.deleteOne();

    res.status(200).send("Password reset is successful, you can now log in with your new password");
}




module.exports = { userSignUp, userLogIn, forgotPassword, resetPassword}