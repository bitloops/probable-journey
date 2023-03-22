import { Application, Either } from '@bitloops/bl-boilerplate-core';

export interface UserRepoPort {
  getByEmail(email: string): Promise<User | null>;
  checkDoesNotExistAndCreate(
    user: User,
  ): Promise<Either<void, Application.Repo.Errors.Conflict>>;
}

export const UserRepoPortToken = Symbol('UserRepoPortToken');
