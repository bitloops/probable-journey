import { Application, Domain } from '@bitloops/bl-boilerplate-core';
import { UserEntity } from '../domain/UserEntity.js';

export interface UserWriteRepoPort extends Application.Repo.ICRUDWritePort<
  UserEntity,
  Domain.UUIDv4
> {
};

export const UserWriteRepoPortToken = Symbol('UserWriteRepoPort');
