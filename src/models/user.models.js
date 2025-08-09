/*
id string pk
username string
email string
fullName string
avatar string
coverImage string
watchHistory ObjectId[] videos
password string
refreshToken string
createdAt Date
updatedAt Date
*/

import bcrypt from "bcrypt";

import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
//destructure the schema so that we dont have to revisit it

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            uninique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type : String,
            required: true,
            uninique: true,
            lowercase: true,
            trim: true,
        },
        fullname: {
            type: String,
            required: true,
            index: true,
            trim: true,
        },
        avatar: {
            type: String, //cloudinary URL
            required: true
        },
        coverImage: {
            type: String, //cloudinary URL            
        }
    ,
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true, "password is required"]
    },
    refreshToken: {
        type: String,
    }
    },
    { timestamps: true } 
    //This automatically creates createdAt and updatedAt fields for us

)
// dont need to add id because mongoose already handles that 
// mongoose adds in between layers to validate the data 


userSchema.pre("save", async function (next) {

    if(!this.modified("password")) return next ()

    //the password should only be modified at the time of save
    //or at the time of update, not any time else hence we exit 

    this.password = bcrypt.hash(this.password, 12);

    //we are encrypting the password before it saves in db 12 meaning 12 
    // rounds of hashing so that the password is more secure

    next()
})

//standard procedure is to add next to pass it along the next middleware
// this is for the pre save middleware
// we are using this to make sure that the password is hashed before we save it to the database
// we are using the bcryptjs library to hash the password


userSchema.methods.isPasswordCorrect = async function(password){
   return bcrypt.compare(password,  this.password)
     //this is the password that we are checking against the hashed password    
}

//JWT tokens

userSchema.methods.generateAccessToken = function () {
    jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullName,

    },
     process.env.ACCESS_TOKEN_SECRET, { 
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
}

userSchema.methods.generateRefreshToken = function () {
    jwt.sign({
        _id: this._id,
    },
     process.env.REFRESH_TOKEN_SECRET, { 
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
}

//short lived access token (for authenticating sign ins)


export const User = mongoose.model("User", userSchema);

//we are creating a document with the name user and 
// the schema we created above and use mongoose feature
//we will mention the name of schema that we will use in the doc
//This is a variable designed with Mongoose

