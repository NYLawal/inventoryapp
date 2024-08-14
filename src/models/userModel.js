const mongoose = require("mongoose");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      minlength:7,
      maxlength: 50,
    },
    lastname: {
      type: String,
      minlength:7,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique:true,
      match: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
    },
    password: {
      type: String,
      required: true,
      maxlength: 1024
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function() {
 const salt = await bcrypt.genSalt(10)
 this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods.generateToken = function(){
  const payload = {
    _id: this._id,
    email: this.email,
    isAdmin: this.isAdmin
  }
  const token = jwt.sign(payload, process.env.jwt_secret_key, { expiresIn: process.env.jwt_lifetime });
  return token 
}

userSchema.methods.comparePassword = async function(userPassword){
  const isMatch = await bcrypt.compare(userPassword, this.password)
  return isMatch
}

const User = mongoose.model("User", userSchema);
module.exports = User;