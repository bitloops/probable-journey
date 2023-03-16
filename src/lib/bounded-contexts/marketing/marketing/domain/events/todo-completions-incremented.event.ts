import { Domain } from '@bitloops/bl-boilerplate-core';
import { UserEntity } from '../user.entity';

export class TodoCompletionsIncrementedDomainEvent
  implements Domain.IDomainEvent<UserEntity>
{
  public metadata: any;
  public aggregateId: string;

  constructor(public readonly data: UserEntity, uuid?: string) {
    this.metadata = {
      fromContextId: 'Marketing',
      id: uuid,
    };
    this.aggregateId = data.id.toString();
  }
}
