import { Application, Domain } from '@bitloops/bl-boilerplate-core';
import { UserEntity } from '../domain/user.entity';

export interface UserWriteRepoPort extends Application.Repo.ICRUDWritePort<
  UserEntity,
  Domain.UUIDv4
> {
};

export const UserWriteRepoPortToken = Symbol('UserWriteRepoPort');
