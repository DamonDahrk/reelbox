import { Router } from "express";

import { registerUser } from "../controllers/user.controllers.js";

import {upload} from "../middlewares/multer.middlewares.js";

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




export default router;