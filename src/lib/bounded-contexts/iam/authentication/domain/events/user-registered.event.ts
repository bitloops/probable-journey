import { Domain } from '@bitloops/bl-boilerplate-core';
import { UserEntity } from '../UserEntity';

export class UserRegisteredDomainEvent
  implements Domain.IDomainEvent<UserEntity>
{
  public metadata: any;
  public aggregateId: any;

  constructor(public readonly data: UserEntity, uuid?: string) {
    this.metadata = {
      fromContextId: 'IAM',
      id: uuid,
    };
    this.aggregateId = data.id.toString();
  }
}
