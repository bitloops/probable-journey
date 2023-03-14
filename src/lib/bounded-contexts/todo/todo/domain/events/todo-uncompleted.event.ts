import { Domain } from '@bitloops/bl-boilerplate-core';
import { TodoEntity } from '../TodoEntity';

export class TodoUncompletedDomainEvent extends Domain.Event<TodoEntity> {
  public static readonly eventName = TodoUncompletedDomainEvent.name;
  public static readonly fromContextId = 'Todo';

  constructor(public readonly todo: TodoEntity, uuid?: string) {
    const metadata = {
      fromContextId: TodoUncompletedDomainEvent.fromContextId,
      id: uuid,
    };
    super(TodoUncompletedDomainEvent.getEventTopic(), todo, metadata, todo.id);
  }

  static getEventTopic() {
    return TodoUncompletedDomainEvent.eventName;
  }
}
