import { Application, Domain } from '@bitloops/bl-boilerplate-core';
import { asyncLocalStorage } from '@bitloops/bl-boilerplate-infra-telemetry';

export class GetTodosQuery implements Application.IQuery {
  public metadata: Application.TQueryMetadata;
  public readonly boundedContext = 'Todo';

  constructor() {
    this.metadata = {
      boundedContextId: 'Todo',
      createdTimestamp: Date.now(),
      correlationId: asyncLocalStorage.getStore()?.get('correlationId'),
      context: asyncLocalStorage.getStore()?.get('context'),
      messageId: new Domain.UUIDv4().toString(),
    };
  }
}
