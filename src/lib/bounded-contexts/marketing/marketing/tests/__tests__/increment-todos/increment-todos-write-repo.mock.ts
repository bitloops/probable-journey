import {
  Application,
  Domain,
  Either,
  ok,
  fail,
} from '@src/bitloops/bl-boilerplate-core';
import { UserEntity } from '@src/lib/bounded-contexts/marketing/marketing/domain/user.entity';
import { UserWriteRepoPort } from '@src/lib/bounded-contexts/marketing/marketing/ports/user-write.repo-port';
import {
  INCREMENT_TODOS_INVALID_COUNTER_CASE,
  INCREMENT_TODOS_SUCCESS_USER_DOESNT_EXIST_CASE,
  INCREMENT_TODOS_SUCCESS_USER_EXISTS_CASE,
} from './increment-todos.mock';
import { DomainErrors } from '@src/lib/bounded-contexts/marketing/marketing/domain/errors';

export class MockIncrementCompletedTodosWriteRepo {
  public readonly mockSaveMethod: jest.Mock;
  public readonly mockGetByIdMethod: jest.Mock;
  private mockTodoWriteRepo: UserWriteRepoPort;

  constructor() {
    this.mockSaveMethod = this.getMockSaveMethod();
    this.mockGetByIdMethod = this.getMockGetByIdMethod();
    this.mockTodoWriteRepo = {
      save: this.mockSaveMethod,
      getById: this.mockGetByIdMethod,
      update: jest.fn(),
      delete: jest.fn(),
    };
  }

  getMockTodoWriteRepo(): UserWriteRepoPort {
    return this.mockTodoWriteRepo;
  }

  private getMockSaveMethod(): jest.Mock {
    return jest.fn(
      (
        user: UserEntity,
      ): Promise<Either<void, Application.Repo.Errors.Unexpected>> => {
        // if (
        //   user.id.equals(new Domain.UUIDv4(INCREMENT_TODOS_SUCCESS_CASE.userId))
        // ) {
        //   return Promise.resolve(
        //     fail(new Application.Repo.Errors.Unexpected('Unexpected error')),
        //   );
        // }
        return Promise.resolve(ok());
      },
    );
  }

  private getMockGetByIdMethod() {
    return jest.fn(
      (
        id: Domain.UUIDv4,
      ): Promise<
        Either<
          UserEntity | null,
          | DomainErrors.InvalidTodosCounterError
          | Application.Repo.Errors.Unexpected
        >
      > => {
        if (
          id.equals(
            new Domain.UUIDv4(INCREMENT_TODOS_SUCCESS_USER_EXISTS_CASE.userId),
          )
        ) {
          const todo = UserEntity.fromPrimitives(
            INCREMENT_TODOS_SUCCESS_USER_EXISTS_CASE,
          );
          return Promise.resolve(ok(todo));
        }
        if (
          id.equals(
            new Domain.UUIDv4(
              INCREMENT_TODOS_SUCCESS_USER_DOESNT_EXIST_CASE.userId,
            ),
          )
        ) {
          return Promise.resolve(ok(null));
        }
        if (
          id.equals(
            new Domain.UUIDv4(INCREMENT_TODOS_INVALID_COUNTER_CASE.userId),
          )
        ) {
          return Promise.resolve(
            fail(new DomainErrors.InvalidTodosCounterError()),
          );
        }
        return Promise.resolve(ok(null));
      },
    );
  }
}
