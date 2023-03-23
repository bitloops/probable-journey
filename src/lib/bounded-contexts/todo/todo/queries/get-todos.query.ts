import { Application } from '@bitloops/bl-boilerplate-core';

export class GetTodosQuery implements Application.IQuery {
  public metadata: Application.TQueryMetadata;
  public readonly boundedContext = 'Todo';

  constructor(public ctx: any) {
    this.metadata = {
      toContextId: 'Todo',
      createdTimestamp: Date.now(),
    };
  }
}
