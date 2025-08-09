const asyncHandler = (requestHandler) => {
    return (req , res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch
        ((err) => next(err))
    }
    
}

export {asyncHandler}

//based on response req we are sending in the requestHandler to handle error in try catch block