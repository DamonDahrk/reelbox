import { Router } from "express";

import { registerUser, logOutUser } from "../controllers/user.controllers.js";

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

    //secured routes

    router.route("/logout").post(verifyJWT, logOutUser);

    //this is where next middle comes in from one to another 




export default router;