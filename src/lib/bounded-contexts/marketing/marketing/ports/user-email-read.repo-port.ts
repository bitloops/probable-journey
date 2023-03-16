import { Application, Domain } from '@bitloops/bl-boilerplate-core';
import { UserEmailReadModel } from '../domain/read-models/user-email.read-model';

export interface UserEmailReadRepoPort extends Application.Repo.ICRUDReadPort<UserEmailReadModel> {
    getUserEmail(userid: Domain.UUIDv4): Promise<string>;
    save(userEmailReadModel: UserEmailReadModel): Promise<void>;
};


export const UserEmailReadRepoPortToken = Symbol('UserEmailReadRepoPort');
