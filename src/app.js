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

//middleware for Express.js applications that parses the cookies 
// attached to the client’s HTTP request
// It populates req.cookies with cookie data for easy retrieval.

//Here we are using express features, to first parse the JSON requests
//to upto 16kb, then parse URL encoded requests to the same limit.
//serve static files from the public folder

// import routes 
import healthcheckRouter from "./routes/healthcheck.routes.js";
import { cookie } from "express/lib/response.js";

//import route handlers exported from given fpath


// routes

app.use("/api/v1/healthcheck", healthcheckRouter);

//Registers the imported router for all endpoints that start with /api/v1/healthcheck


export  { app };

