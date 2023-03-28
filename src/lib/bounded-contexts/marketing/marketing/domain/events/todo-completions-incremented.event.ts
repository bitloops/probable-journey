import { Domain } from '@bitloops/bl-boilerplate-core';
import { asyncLocalStorage } from '@src/bitloops/tracing';
import { UserEntity } from '../user.entity';

export class TodoCompletionsIncrementedDomainEvent
  implements Domain.IDomainEvent<UserEntity>
{
  public metadata: Domain.TDomainEventMetadata;
  public aggregateId: string;

  constructor(public readonly data: UserEntity) {
    const uuid = new Domain.UUIDv4();
    this.metadata = {
      fromContextId: 'Marketing',
      createdAtTimestamp: Date.now(),
      id: uuid.toString(),
      context: asyncLocalStorage.getStore()?.get('context'),
      messageId: new Domain.UUIDv4().toString(),
      correlationId: asyncLocalStorage.getStore()?.get('correlationId'),
    };
    this.aggregateId = data.id.toString();
  }
}
