import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

//cors is who can talk to your application
// Restricts cross-origin requests to just the origin specified in your environment variable CORS_ORIGIN.
//For example, if you set CORS_ORIGIN=http://localhost:3000, only that site can make requests.

//Allows cookies and auth headers to be sent with requests (enables credentials in CORS).

const app = express();

app.use(
 cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
 })
);


//common middleware
app.use(express.json({limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb"}));
app.use(express.static("public"));

app.use(cookieParser());


//that handles multipart/form-data requests, which are 
// primarily used for uploading files
//middleware for Express.js applications that parses the cookies 
// attached to the client’s HTTP request
// It populates req.cookies with cookie data for easy retrieval.

//Here we are using express features, to first parse the JSON requests
//to upto 16kb, then parse URL encoded requests to the same limit.
//serve static files from the public folder

// import routes 
import healthcheckRouter from "./routes/healthcheck.routes.js";
import userRouter from "./routes/user.routes.js";
//import { cookie } from "express/lib/response.js";

//app.use(cookieParser()); we use like this

import { errorHandler } from "./middlewares/error.middlewares.js";

//we are inputting the users routes from the file
//we are importing the router from the file

//import route handlers exported from given fpath


// routes

app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/users", userRouter);

//Registers the imported router for all endpoints that start with /api/v1/healthcheck

app.use(errorHandler);
export  { app };

    
