const express = require('express');
const router = express.Router();
const {userSignUp,userLogIn,forgotPassword,resetPassword} 
       = require('../controllers/userController') 


router.route('/signup').post(userSignUp)
router.route('/login').post(userLogIn)
router.post('/forgotPassword', forgotPassword)
router.post('/password-reset/:userId/:token', resetPassword)


module.exports = router;