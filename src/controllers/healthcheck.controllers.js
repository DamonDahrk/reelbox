import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

//this is how everything is promisified and in error handled

const healthcheck = asyncHandler ( async (requestAnimationFrame,res) => {
    return res 
    .status (200)
    .json ( new ApiResponse (200,"OK","Health check successful") )
} );
 

export { healthcheck };