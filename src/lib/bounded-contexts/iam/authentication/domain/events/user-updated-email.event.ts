import { Domain } from '@bitloops/bl-boilerplate-core';
import { UserEntity } from '../UserEntity';

export class UserUpdatedEmailDomainEvent
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

  //   constructor(public readonly user: UserEntity, uuid?: string) {
  //     const metadata = {
  //       fromContextId: UserUpdatedEmailDomainEvent.fromContextId,
  //       id: uuid,
  //     };
  //     super(UserUpdatedEmailDomainEvent.getEventTopic(), user, metadata, user.id);
  //   }

  //   static getEventTopic() {
  //     return UserUpdatedEmailDomainEvent.eventName;
  //   }
}
