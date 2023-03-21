import { Application, Domain } from '@bitloops/bl-boilerplate-core';
import { UserReadModel } from '../domain/read-models/user-email.read-model';

export interface UserEmailReadRepoPort
  extends Application.Repo.ICRUDReadPort<UserReadModel> {
  getUserEmail(userid: Domain.UUIDv4): Promise<UserReadModel | null>;
  save(userReadModel: UserReadModel): Promise<void>;
  create(userReadModel: UserReadModel): Promise<void>;
}

export const UserEmailReadRepoPortToken = Symbol('UserEmailReadRepoPort');
