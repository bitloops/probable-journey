import { RepoError } from '@src/bitloops/bl-boilerplate-core/application/RepoError';

export class ConflictError extends RepoError {
  static errorId = '7bd7e576-de21-4cc2-a2ab-8d77915da90r';

  constructor(id: string) {
    super(`${id} already exists`, ConflictError.errorId);
  }
}
