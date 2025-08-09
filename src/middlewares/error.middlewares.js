import mongoose, { MongooseError } from "mongoose";

import { ApiError } from "../utils/ApiError.js";

//we are catching any error thrown and passed by next(err)

const errorHandler = (err, req, res, next) => {
  let error = err

  if (!(error instanceof ApiError)) {
const statusCode =
  error.statusCode ||
  (error instanceof mongoose.Error ? 400 : 500);

    const message = error.message || "Something went wrong!";

    error = new ApiError(
        statusCode, 
        message, 
        error?.errors ||
        [], 
        err.stack);
  }

  //if the error is not an instance of ApiError, we check for:
  // if its Mongoose then throw 400(bad req) else throw 400(server related)
  // set error to errors property if available else return empty array
  // we are using stack to debug

   const response = {
    ...error,
    message: error.message,
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
  };

//...error copies all enumerable own properties from the error
//  object into the new response object.

console.error(error);

//in dev mode the stack is included in the response to debug
//in prod is hidden
    
    return res.status (error.statusCode).json(response);
 //sends http response with status code and error message in JSON format

};

export {errorHandler};