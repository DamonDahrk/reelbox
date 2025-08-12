import { Router } from "express";

import { registerUser,
     logOutUser,
     loginUser,
      refreshAccessToken,
      getCurrentUser,
      getUserChannelProfile,
      updateAccountDetails,
      updateUserAvatar,
      updateUserCoverImage,
      getWatchHistory
     } from "../controllers/user.controllers.js";

import {upload} from "../middlewares/multer.middlewares.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();


//we are posting data to register to the server and database
//field to include avatar array and etc data



router.route("/register").post(
    upload.fields(
        [
            {
                name: "avatar",
                maxCount: 1
            },
            {
                name: "coverImage",
                maxCount: 1
            }
        ]
    ),

    registerUser);

    router.route("/login").post(loginUser);
    
    router.route("/refresh-token").post(refreshAccessToken);

    //secured routes

    router.route("/change-password").post(verifyJWT, getCurrentUser);
    router.route("/logout").post(verifyJWT, logOutUser);
    router.route("/current-user").get(verifyJWT, getCurrentUser);
    router.route("/c/:username").get(verifyJWT, getUserChannelProfile);
    //this is why channel had the req dot param thing
    router.route("/update-account").patch(verifyJWT, 
        updateAccountDetails);
    router.route("/avatar").patch(verifyJWT, upload.single("avatar")
    , updateUserAvatar);
    router.route("/cover-image").patch(verifyJWT, upload.single("coverImage")
    , updateUserCoverImage);
    router.route("/history").get(verifyJWT, getWatchHistory);
    




    //this is where next middle comes in from one to another 




export default router;