import express from 'express';

class ApiError extends Error {
   constructor(statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
   ){
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.error = errors;

    if(stack){
        this.stack = stack;
    }else{
        Error.captureStackTrace(this, this.constructor);
    }

   }
}

export {ApiError}

//We are creating a custom error class called ApiError that extends the built-in JavaScript Error class.
// here super() is used to call the parent class  as we are extending the error class
// stack is a property of the Error class that contains the stack trace of error object.

//If a stack is provided to the constructor, it sets it manually.
//Otherwise, it uses Error.captureStackTrace to generate the stack trace for this error object.