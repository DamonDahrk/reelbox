import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

//this is how everything is promisified and in error handled

const healthcheck = asyncHandler ( async (requestAnimationFrame,res) => {
    return res 
    .status (200)
    .json ( new ApiResponse (200,"OK","Health check successful") )
} );
 

export { healthcheck };

//we are sending ok status message and code and reqAnimation Frame is a browser thing wait for the request to be finished and then send the response
// no need for trycatch are its already handled by asyncHandler. 