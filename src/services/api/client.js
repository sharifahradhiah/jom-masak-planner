export class ApiError extends Error {
  constructor(message, code = 'UNKNOWN') {
    super(message);
    this.code = code;
  }
}
