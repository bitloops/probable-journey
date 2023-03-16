import { Domain } from '@bitloops/bl-boilerplate-core';
import { UserEntity } from '../UserEntity';

export class UserLoggedInDomainEvent
  implements Domain.IDomainEvent<UserEntity>
{
  public metadata: any;
  public aggregateId: string;

  constructor(public readonly data: UserEntity, uuid?: string) {
    this.metadata = {
      fromContextId: 'IAM',
      id: uuid,
    };
    this.aggregateId = data.id.toString();
  }
}
