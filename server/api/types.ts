export class ApiError extends Error {
  code: string;
  status: number;
  retryable: boolean;
  fieldErrors?: Record<string, string>;

  constructor(
    message: string,
    options: {
      code: string;
      status?: number;
      retryable?: boolean;
      fieldErrors?: Record<string, string>;
    }
  ) {
    super(message);
    this.name = "ApiError";
    this.code = options.code;
    this.status = options.status ?? 500;
    this.retryable = options.retryable ?? false;
    this.fieldErrors = options.fieldErrors;
  }
}
