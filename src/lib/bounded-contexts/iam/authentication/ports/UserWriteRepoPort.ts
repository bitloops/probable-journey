import { Application, Domain } from '@bitloops/bl-boilerplate-core';
import { EmailVO } from '../domain/EmailVO.js';
import { UserEntity } from '../domain/UserEntity.js';

// TODO check this
export interface UserWriteRepoPort
  extends Application.Repo.ICRUDWritePort<UserEntity, Domain.UUIDv4> {
  getByEmail(email: EmailVO): Promise<UserEntity | null>;
}

export const UserWriteRepoPortToken = Symbol('UserWriteRepoPort');
