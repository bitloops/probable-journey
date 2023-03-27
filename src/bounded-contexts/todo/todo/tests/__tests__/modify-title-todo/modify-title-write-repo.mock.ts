import { Application } from '@src/bitloops/bl-boilerplate-core';
import { TodoEntity } from '@src/lib/bounded-contexts/todo/todo/domain/TodoEntity';
import { TodoWriteRepoPort } from '@src/lib/bounded-contexts/todo/todo/ports/TodoWriteRepoPort';

export class ModifyTitleWriteRepo {
  private mockTodoWriteRepo: TodoWriteRepoPort;
  public readonly mockUpdateMethod: jest.Mock;

  constructor() {
    this.mockUpdateMethod = this.getMockUpdateMethod();
    this.mockTodoWriteRepo = {
      save: this.mockUpdateMethod,
      getById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
  }

  public getMockTodoWriteRepo(): TodoWriteRepoPort {
    return this.mockTodoWriteRepo;
  }

  private getMockUpdateMethod(): jest.Mock {
    return jest.fn((todo: TodoEntity): Promise<void> => {
      // TODO this should return a Promise<Either<void, Application.Repo.Errors.Unexpected>> and import fail from npm package
      //   if (todo.userId.id.equals(new Domain.UUIDv4(FAILED_USER_ID))) {
      //     return fail(new Application.Repo.Errors.Unexpected('Unexpected error'));
      //   }
      return Promise.resolve();
    });
  }
}
