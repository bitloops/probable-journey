import { TodoWriteRepoPort } from '@src/lib/bounded-contexts/todo/todo/ports/TodoWriteRepoPort';

export class MockAddTodoWriteRepo {
  private mockSaveMethod = jest.fn();
  private mockTodoWriteRepo: TodoWriteRepoPort;

  constructor() {
    this.mockTodoWriteRepo = {
      save: this.mockSaveMethod,
      getById: jest.fn(),
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
}
