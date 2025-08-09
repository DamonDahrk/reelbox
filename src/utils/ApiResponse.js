class ApiResponse {
    construtor(statusCode, data, message = "Success"){
        this.statusCode = statusCode;
        this.Data = data;
        this.Message = message;
        this.success = statusCode < 400;
    }
}

export { ApiResponse }