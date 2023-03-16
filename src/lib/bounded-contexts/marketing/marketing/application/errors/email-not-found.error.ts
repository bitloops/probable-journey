import { Application, Domain } from '@bitloops/bl-boilerplate-core';

export class EmailNotFoundError extends Application.Error {
  static readonly errorId = '';

  constructor(userId: string) {
    super(`Email 
    for user ${userId} not found`, EmailNotFoundError.errorId);
  }
}
