import { Application, Domain, Either } from '@bitloops/bl-boilerplate-core';
import { EmailVO } from '../domain/EmailVO.js';
import { UserEntity } from '../domain/UserEntity.js';

// TODO check this
export interface UserWriteRepoPort
  extends Application.Repo.ICRUDWritePort<UserEntity, Domain.UUIDv4> {
  getByEmail(email: EmailVO): Promise<UserEntity | null>;
  checkDoesNotExistAndCreate(
    user: UserEntity,
  ): Promise<Either<void, Application.Repo.Errors.Conflict>>;
}

export const UserWriteRepoPortToken = Symbol('UserWriteRepoPort');
