import { Domain } from '@bitloops/bl-boilerplate-core';
import { TodoEntity } from '../TodoEntity';

export class TodoTitleModifiedDomainEvent
  implements Domain.IDomainEvent<TodoEntity>
{
  public aggregateId: any;
  public metadata: any;

  constructor(public readonly data: TodoEntity, uuid?: string) {
    this.metadata = {
      fromContextId: 'Todo',
      id: uuid,
    };
    this.aggregateId = data.id;
  }
}
