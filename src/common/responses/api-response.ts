export class ApiResponse {
  static success<T>(
    message: string,
    data: T,
    meta: Record<string, unknown> | null = null,
  ) {
    return {
      success: true,
      message,
      data,
      meta,
      errors: null,
    };
  }

  static error(message: string, errors: unknown = null) {
    return {
      success: false,
      message,
      data: null,
      meta: null,
      errors,
    };
  }
}
