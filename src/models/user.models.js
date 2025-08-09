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

import { type } from "express/lib/response";
import mongoose, { Schema } from "mongoose";
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

export const User = mongoose.model("User", userSchema);

//we are creating a document with the name user and 
// the schema we created above and use mongoose feature
//we will mention the name of schema that we will use in the doc
//This is a variable designed with Mongoose