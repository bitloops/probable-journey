import { Domain } from '@bitloops/bl-boilerplate-core';
import { UserEntity } from '../user.entity';

export class TodoCompletionsIncrementedDomainEvent extends Domain.Event<UserEntity> {
  public static readonly eventName = TodoCompletionsIncrementedDomainEvent.name;
  public static readonly fromContextId = 'Marketing';

  constructor(public readonly user: UserEntity, uuid?: string) {
    const metadata = {
      fromContextId: TodoCompletionsIncrementedDomainEvent.fromContextId,
      id: uuid,
    };
    super(TodoCompletionsIncrementedDomainEvent.getEventTopic(), user, metadata, user.id);
  }

  static getEventTopic() {
    return TodoCompletionsIncrementedDomainEvent.eventName;
  }
}