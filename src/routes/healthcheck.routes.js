import { Router } from "express";

import { healthcheck } from "../controllers/healthcheck.controllers.js";

const router = Router();



router.route("/").get(healthcheck); 
router.route("/test").get(healthcheck); 

//here we are testing the health check route by sending a get request.


export default router;