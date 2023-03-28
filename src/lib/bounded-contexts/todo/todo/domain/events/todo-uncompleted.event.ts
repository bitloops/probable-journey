import { Application, Domain } from '@bitloops/bl-boilerplate-core';
import { TodoEntity } from '../TodoEntity';

export class TodoUncompletedDomainEvent
  implements Domain.IDomainEvent<TodoEntity>
{
  public aggregateId: any;
  public metadata: Domain.TDomainEventMetadata;

  constructor(public readonly data: TodoEntity, ctx?: Application.TContext) {
    const uuid = new Domain.UUIDv4();
    this.metadata = {
      fromContextId: 'Todo',
      createdAtTimestamp: Date.now(),
      id: uuid.toString(),
      context: ctx,
    };
    this.aggregateId = data.id;
  }
}
