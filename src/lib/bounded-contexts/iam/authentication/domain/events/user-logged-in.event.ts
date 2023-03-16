import { Domain } from '@bitloops/bl-boilerplate-core';
import { UserEntity } from '../UserEntity';

export class UserLoggedInDomainEvent extends Domain.Event<UserEntity> {
  public static readonly eventName = UserLoggedInDomainEvent.name;
  public static readonly fromContextId = 'IAM';

  constructor(public readonly user: UserEntity, uuid?: string) {
    const metadata = {
      fromContextId: UserLoggedInDomainEvent.fromContextId,
      id: uuid,
    };
    super(UserLoggedInDomainEvent.getEventTopic(), user, metadata, user.id);
  }

  static getEventTopic() {
    return UserLoggedInDomainEvent.eventName;
  }
}
