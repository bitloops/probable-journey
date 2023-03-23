import { Application } from '@src/bitloops/bl-boilerplate-core';
import { TodoEntity } from '@src/lib/bounded-contexts/todo/todo/domain/TodoEntity';
import { TodoWriteRepoPort } from '@src/lib/bounded-contexts/todo/todo/ports/TodoWriteRepoPort';
import { FAILED_USER_ID } from './add-todo.mock';

export class MockAddTodoWriteRepo {
  private mockTodoWriteRepo: TodoWriteRepoPort;
  public readonly mockSaveMethod: jest.Mock;

  constructor() {
    this.mockSaveMethod = this.getMockSaveMethod();
    this.mockTodoWriteRepo = {
      save: this.mockSaveMethod,
      getById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
  }

  public getMockTodoWriteRepo(): TodoWriteRepoPort {
    return this.mockTodoWriteRepo;
  }

  private getMockSaveMethod(): jest.Mock {
    return jest.fn((todo: TodoEntity): Promise<void> => {
      // TODO this should return a Promise<Either<void, Application.Repo.Errors.Unexpected>> and import fail from npm package
      if (todo.userId.id.toString() === FAILED_USER_ID) {
        return fail(new Application.Repo.Errors.Unexpected('Unexpected error'));
      }
      return Promise.resolve();
    });
  }
}
