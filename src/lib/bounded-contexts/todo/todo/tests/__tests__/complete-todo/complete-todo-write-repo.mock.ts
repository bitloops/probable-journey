import {
  Application,
  Domain,
  Either,
  ok,
} from '@src/bitloops/bl-boilerplate-core';
import { TodoEntity } from '@src/lib/bounded-contexts/todo/todo/domain/TodoEntity';
import { TodoWriteRepoPort } from '@src/lib/bounded-contexts/todo/todo/ports/TodoWriteRepoPort';
import {
  COMPLETE_TODO_NOT_FOUND_CASE,
  COMPLETE_TODO_SUCCESS_CASE,
} from './complete-todo.mock';

export class MockCompleteTodoWriteRepo {
  public readonly mockSaveMethod: jest.Mock;
  public readonly mockGetByIdMethod: jest.Mock;
  private mockTodoWriteRepo: TodoWriteRepoPort;

  constructor() {
    this.mockSaveMethod = this.getMockSaveMethod();
    this.mockGetByIdMethod = this.getMockById();
    this.mockTodoWriteRepo = {
      save: this.mockSaveMethod,
      getById: this.mockGetByIdMethod,
      update: jest.fn(),
      delete: jest.fn(),
    };
  }

  getMockTodoWriteRepo(): TodoWriteRepoPort {
    return this.mockTodoWriteRepo;
  }

  private getMockSaveMethod(): jest.Mock {
    return jest.fn(
      (
        todo: TodoEntity,
      ): Promise<Either<void, Application.Repo.Errors.Unexpected>> => {
        // TODO this should return a Promise<Either<void, Application.Repo.Errors.Unexpected>> and import fail from npm package
        if (todo.userId.id.equals(new Domain.UUIDv4('1234'))) {
          return fail(
            new Application.Repo.Errors.Unexpected('Unexpected error'),
          );
        }
        return Promise.resolve(ok());
      },
    );
  }

  private getMockById() {
    return jest.fn(
      (
        id: Domain.UUIDv4,
      ): Promise<
        Either<TodoEntity | null, Application.Repo.Errors.Unexpected>
      > => {
        if (id.equals(new Domain.UUIDv4(COMPLETE_TODO_SUCCESS_CASE.id))) {
          const todo = TodoEntity.fromPrimitives(COMPLETE_TODO_SUCCESS_CASE);
          return Promise.resolve(ok(todo));
        }
        if (id.equals(new Domain.UUIDv4(COMPLETE_TODO_NOT_FOUND_CASE.id))) {
          return Promise.resolve(ok(null));
        }
        return Promise.resolve(ok(null));
      },
    );
  }
}
