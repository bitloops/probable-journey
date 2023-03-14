import { Application, Either, ok } from '@bitloops/bl-boilerplate-core';
import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { TodoReadModel } from '../../domain/TodoReadModel';
import {
  TodoReadRepoPortToken,
  TodoReadRepoPort,
} from '../../ports/TodoReadRepoPort';
import { GetTodosQuery } from '../../queries/get-todos.query';

export type GetTodosQueryHandlerResponse = Either<TodoReadModel[], never>;

@QueryHandler(GetTodosQuery)
export class GetTodosHandler
  implements
    Application.IUseCase<GetTodosQuery, Promise<GetTodosQueryHandlerResponse>>
{
  constructor(
    @Inject(TodoReadRepoPortToken) private todoRepo: TodoReadRepoPort,
  ) {}
  async execute(query: GetTodosQuery): Promise<GetTodosQueryHandlerResponse> {
    const todos = await this.todoRepo.getAll();
    return ok(todos);
  }
}
