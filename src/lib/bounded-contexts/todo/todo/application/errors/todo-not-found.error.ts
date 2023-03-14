import { Domain } from '@bitloops/bl-boilerplate-core';

export class TodoNotFoundError extends Domain.Error {
  static readonly errorId = '';

  constructor(id: string) {
    super(`Todo ${id} not found`, TodoNotFoundError.errorId);
  }
}
