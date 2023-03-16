import { Application } from '@bitloops/bl-boilerplate-core';

export class GetTodosQuery {
  public readonly boundedContext = 'Todo';
  public readonly createdAt = Date.now();
  constructor(public readonly ctx: any) {}
}

export class GetTodosQueryLegacy extends Application.Query {
  public static readonly queryName = 'Todo.GET_TODOS';
  public ctx: any;
  constructor(ctx: any) {
    super(GetTodosQueryLegacy.queryName, 'Todo');
    this.ctx = ctx;
  }
  static getQueryTopic(): string {
    return super.getQueryTopic(GetTodosQueryLegacy.queryName, 'Todo');
  }
}
