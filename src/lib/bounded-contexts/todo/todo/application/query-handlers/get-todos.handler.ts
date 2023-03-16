import { Application, Either, ok } from '@bitloops/bl-boilerplate-core';
import { Inject } from '@nestjs/common';
// import { QueryHandler } from '@nestjs/cqrs';
import { TTodoReadModelSnapshot } from '../../domain/TodoReadModel';
import {
  TodoReadRepoPortToken,
  TodoReadRepoPort,
} from '../../ports/TodoReadRepoPort';
import { GetTodosQuery } from '../../queries/get-todos.query';

export type GetTodosQueryHandlerResponse = Either<
  TTodoReadModelSnapshot[],
  never
>;

export class GetTodosHandler
  implements
    Application.IQueryHandler<
      GetTodosQuery,
      Promise<GetTodosQueryHandlerResponse>
    >
{
  private ctx: any;
  constructor(
    @Inject(TodoReadRepoPortToken)
    private readonly todoRepo: TodoReadRepoPort,
  ) {}

  get query() {
    return GetTodosQuery;
  }

  get boundedContext() {
    return 'Todo';
  }

  async execute(command: GetTodosQuery): Promise<GetTodosQueryHandlerResponse> {
    this.ctx = command.ctx;
    console.log('GetTodosQuery handler...');

    const results = await this.todoRepo.getAll(this.ctx);
    if (results) return ok(results);
    return ok([]);
  }
}

// @QueryHandler(GetTodosQuery)
// export class GetTodosHandler
//   implements
//     Application.IQueryHandler<
//       GetTodosQuery,
//       Promise<GetTodosQueryHandlerResponse>
//     >
// {
//   get query() {
//     return GetTodosQuery;
//   }

//   get boundedContext() {
//     return 'Todo';
//   }
//   constructor(
//     @Inject(TodoReadRepoPortToken) private todoRepo: TodoReadRepoPort,
//   ) {}

//   async execute(query: GetTodosQuery): Promise<GetTodosQueryHandlerResponse> {
//     const todos = await this.todoRepo.getAll(query.ctx);
//     if (todos) return ok(todos);
//     return ok([]);
//   }
// }
