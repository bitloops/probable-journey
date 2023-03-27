import { Application, Domain } from '@src/bitloops/bl-boilerplate-core';
import { TodoEntity } from '@src/lib/bounded-contexts/todo/todo/domain/TodoEntity';
import { TodoWriteRepoPort } from '@src/lib/bounded-contexts/todo/todo/ports/TodoWriteRepoPort';
import { ADD_TODO_REPO_ERROR_CASE } from './add-todo.mock';

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
      if (
        todo.userId.id.equals(
          new Domain.UUIDv4(ADD_TODO_REPO_ERROR_CASE.userId),
        )
      ) {
        return fail(new Application.Repo.Errors.Unexpected('Unexpected error'));
      }
      return Promise.resolve();
    });
  }
}
