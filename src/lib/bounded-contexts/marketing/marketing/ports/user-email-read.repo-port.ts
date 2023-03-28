import { Application, Domain, Either } from '@bitloops/bl-boilerplate-core';
import { UserReadModel } from '../domain/read-models/user-email.read-model';

export interface UserEmailReadRepoPort
  extends Application.Repo.ICRUDReadPort<UserReadModel> {
  getUserEmail(
    userid: Domain.UUIDv4,
    ctx?: any,
  ): Promise<Either<UserReadModel | null, Application.Repo.Errors.Unexpected>>;
  save(
    userReadModel: UserReadModel,
    ctx?: any,
  ): Promise<Either<void, Application.Repo.Errors.Unexpected>>;
  create(
    userReadModel: UserReadModel,
    ctx?: any,
  ): Promise<Either<void, Application.Repo.Errors.Unexpected>>;
}

export const UserEmailReadRepoPortToken = Symbol('UserEmailReadRepoPort');
