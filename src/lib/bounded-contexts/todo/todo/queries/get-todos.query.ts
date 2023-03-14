import { Application } from '@bitloops/bl-boilerplate-core';

export class GetTodosQuery extends Application.Query {
  public static readonly queryName = 'Todo.GET_TODOS';
  constructor() {
    super(GetTodosQuery.queryName, 'Todo');
  }
  static getQueryTopic(): string {
    return super.getQueryTopic(GetTodosQuery.queryName, 'Todo');
  }
}
