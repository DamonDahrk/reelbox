import jwt from "jsonwebtoken";
import {User} from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// we wont use res so _
// in order to mark the flow will go to controller next we use next(very imp)

export const verifyJWT = asyncHandler(async (req, _, next) =>
     {
        const token = req.cookies.accessToken || req.header
        ("Authorization")?.replace("Bearer ", "");
        if (!token) {
            throw new  ApiError(401, "Unauthorized");
        }
        try {
            const decodedToken = 
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            
            const user = await User.findById(decodedToken?._id)
            .select("-password -refreshToken");
            
            if(!user){
                throw new ApiError(401, "Unauthorized");
            }

            req.user = user; 
            //now it has all the info
            //now transfer the flow to controller: 

            next();


        } catch (error) {
            throw new ApiError(401, error?.message || "Invalid Access Token")
        }

});