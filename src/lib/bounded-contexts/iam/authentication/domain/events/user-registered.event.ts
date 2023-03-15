import { Domain } from '@bitloops/bl-boilerplate-core';
import { UserEntity } from '../UserEntity';

export class UserRegisteredDomainEvent extends Domain.Event<UserEntity> {
  public static readonly eventName = UserRegisteredDomainEvent.name;
  public static readonly fromContextId = 'IAM';

  constructor(public readonly user: UserEntity, uuid?: string) {
    const metadata = {
      fromContextId: UserRegisteredDomainEvent.fromContextId,
      id: uuid,
    };
    super(UserRegisteredDomainEvent.getEventTopic(), user, metadata, user.id);
  }

  static getEventTopic() {
    return UserRegisteredDomainEvent.eventName;
  }
}
