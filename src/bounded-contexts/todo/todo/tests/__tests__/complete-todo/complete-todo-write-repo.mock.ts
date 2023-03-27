import { Domain } from '@src/bitloops/bl-boilerplate-core';
import { TodoEntity } from '@src/lib/bounded-contexts/todo/todo/domain/TodoEntity';
import { TodoWriteRepoPort } from '@src/lib/bounded-contexts/todo/todo/ports/TodoWriteRepoPort';

export class MockCompleteTodoWriteRepo {
  private mockSaveMethod = jest.fn();
  private mockTodoWriteRepo: TodoWriteRepoPort;

  constructor() {
    this.mockTodoWriteRepo = {
      save: this.mockSaveMethod,
      getById: this.getById(),
      update: jest.fn(),
      delete: jest.fn(),
    };
  }

  getMockTodoWriteRepo(): TodoWriteRepoPort {
    return this.mockTodoWriteRepo;
  }

  getMockSaveMethod(): jest.Mock {
    return this.mockSaveMethod;
  }

  private getById() {
    return jest.fn((id: Domain.UUIDv4): Promise<TodoEntity | null> => {
      console.log('id 1', id);
      console.log('new Domain.UUIDv4', new Domain.UUIDv4('todo1'));
      if (id.equals(new Domain.UUIDv4('todo1'))) {
        console.log('id', id);
        return Promise.resolve(null);
      }
      return Promise.resolve(null);
    });
  }
}
