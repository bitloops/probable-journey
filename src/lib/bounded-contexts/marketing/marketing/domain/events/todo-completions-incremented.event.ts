import { Application, Domain } from '@bitloops/bl-boilerplate-core';
import { UserEntity } from '../user.entity';

export class TodoCompletionsIncrementedDomainEvent
  implements Domain.IDomainEvent<UserEntity>
{
  public metadata: Domain.TDomainEventMetadata;
  public aggregateId: string;

  constructor(public readonly data: UserEntity, ctx?: Application.TContext) {
    const uuid = new Domain.UUIDv4();
    this.metadata = {
      fromContextId: 'Marketing',
      createdAtTimestamp: Date.now(),
      id: uuid.toString(),
      context: ctx,
    };
    this.aggregateId = data.id.toString();
  }
}
