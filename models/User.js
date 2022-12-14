const mongdb = require('mongoose')
const Schema = mongdb.Schema
const validator = require('validator')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const UserSchema = new Schema({
    userName:{
        type: String,
        unique: true,
        required: [true, 'Please add a username'],
        maxLength: 10
    },
    gender:{
        type: String,
        required: true,
        enum: ['Male', 'Female']
    },
    age:{
        type: Number,
        required: [true, 'Please add an age'],
        validate: (age) => {
            return typeof age === 'number'
        }
    },
    email:{
        type: String,
        required: [true, 'Please add an email'],
        validate: (email) => {
            return validator.isEmail(email)
        }
    },
    password:{
        type:String,
        required: [true,'Please add a password'],
        validate: (password) =>{
            return validator.isStrongPassword(password)
        }
    },
    firstName:{
        type: String,
        required: true,
        maxLength:10
    },
    lastName:{
        type: String,
        required: true,
        maxLength: 10
    },
    resetPasswordToken:{
        type: String
    },
    resetPasswordExpire: {
        type: Date
    },
    admin: {
        type:Boolean,
        default: false
    }
},{timestamps:true})

UserSchema.pre('save', function(next) {
    this.userName = this.userName.trim()
    this.firstName = this.firstName.trim()
    this.lastName = this.lastName.trim()
    next();
})

UserSchema.pre('save', async function(next) {
    if(!this.isModified('password')) next();

    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

UserSchema.methods.getSignedJwtToken = function(){
    return jwt.sign({
        id: this._id}, 
        process.env.JWT_SECRET, 
        {expiresIn: process.env.JWT_EXPIRE})
}


// method to matchthe password for login
UserSchema.methods.matchPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password)
}
module.exports = mongdb.model('User', UserSchema)