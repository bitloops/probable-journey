import { Application, Domain } from '@bitloops/bl-boilerplate-core';
import { UserEntity } from '../domain/UserEntity.js';

// TODO check this
export interface UserWriteRepoPort
  extends Application.Repo.ICRUDWritePort<UserEntity, Domain.UUIDv4> {
  getByEmail(email: string): Promise<UserEntity | null>;
}

export const UserWriteRepoPortToken = Symbol('UserWriteRepoPort');
