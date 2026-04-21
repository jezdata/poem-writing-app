export declare class ApiError extends Error {
    code: string;
    status: number;
    retryable: boolean;
    fieldErrors?: Record<string, string>;
    constructor(message: string, options: {
        code: string;
        status?: number;
        retryable?: boolean;
        fieldErrors?: Record<string, string>;
    });
}
