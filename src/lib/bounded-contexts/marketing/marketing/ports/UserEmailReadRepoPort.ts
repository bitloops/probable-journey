import { Application, Domain } from '@bitloops/bl-boilerplate-core';
import { UserEmailReadModel } from '../domain/read-models/userEmailReadModel';

export interface UserEmailReadRepoPort extends Application.Repo.ICRUDReadPort<UserEmailReadModel> {
    getUserEmail(userid: Domain.UUIDv4): Promise<string>;
};


export const UserEmailReadRepoPortToken = Symbol('UserEmailReadRepoPort');
