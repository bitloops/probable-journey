import { Domain } from '@bitloops/bl-boilerplate-core';
import { TodoEntity } from '../TodoEntity';

export class TodoTitleModifiedDomainEvent extends Domain.Event<TodoEntity> {
  public static readonly eventName = TodoTitleModifiedDomainEvent.name;
  public static readonly fromContextId = 'Todo';

  constructor(public readonly todo: TodoEntity, uuid?: string) {
    const metadata = {
      fromContextId: TodoTitleModifiedDomainEvent.fromContextId,
      id: uuid,
    };
    super(
      TodoTitleModifiedDomainEvent.getEventTopic(),
      todo,
      metadata,
      todo.id,
    );
  }

  static getEventTopic() {
    return TodoTitleModifiedDomainEvent.eventName;
  }
}
