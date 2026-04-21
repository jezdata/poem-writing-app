export class ApiError extends Error {
    constructor(message, options) {
        super(message);
        this.name = "ApiError";
        this.code = options.code;
        this.status = options.status ?? 500;
        this.retryable = options.retryable ?? false;
        this.fieldErrors = options.fieldErrors;
    }
}
