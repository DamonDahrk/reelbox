class ApiResponse {
    constructor(statusCode, data, message = "Success"){
        this.statusCode = statusCode;
        this.Data = data;
        this.Message = message;
        this.success = statusCode < 400;
    }
}

export { ApiResponse }

//we are standardizing the response object to help front end team
//The frontend knows every response will have
//standardize how responses are sent to the client.

//we will have a reusable template with this method like new ApiResponse(200, { id: 1 }, "User fetched successfully");