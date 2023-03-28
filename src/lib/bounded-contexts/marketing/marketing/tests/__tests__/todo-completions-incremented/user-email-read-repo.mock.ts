import {
  Application,
  Domain,
  Either,
  ok,
} from '@src/bitloops/bl-boilerplate-core';
import { UserReadModel } from '../../../domain/read-models/user-email.read-model';
import { UserEmailReadRepoPort } from '../../../ports/user-email-read.repo-port';

export class MockUserEmailReadRepo {
  public readonly mockGetUserEmailMethod: jest.Mock;
  private mockUserEmailReadRepo: UserEmailReadRepoPort;

  constructor() {
    this.mockGetUserEmailMethod = this.getMockGetUserEmailMethod();
    this.mockUserEmailReadRepo = {
      getUserEmail: this.mockGetUserEmailMethod,
      save: jest.fn(),
      create: jest.fn(),
      getAll: jest.fn(),
      getById: jest.fn(),
    };
  }

  getMockUserEmailReadRepo(): UserEmailReadRepoPort {
    return this.mockUserEmailReadRepo;
  }

  private getMockGetUserEmailMethod(): jest.Mock {
    return jest.fn(
      (
        userid: Domain.UUIDv4,
      ): Promise<
        Either<UserReadModel | null, Application.Repo.Errors.Unexpected>
      > => {
        return Promise.resolve(ok(null));
      },
    );
  }
}
