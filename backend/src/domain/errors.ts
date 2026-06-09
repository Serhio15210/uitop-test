export type DomainErrorCode =
  | "CATEGORY_LIMIT"
  | "CATEGORY_NOT_FOUND"
  | "INVALID_CATEGORY"
  | "INVALID_COMPLETED"
  | "INVALID_TEXT"
  | "TODO_NOT_FOUND";

export class DomainError extends Error {
  constructor(
    public readonly code: DomainErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "DomainError";
  }
}
