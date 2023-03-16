import { Domain } from '@bitloops/bl-boilerplate-core';
import { TodoEntity } from '../TodoEntity';

export class TodoAddedDomainEvent implements Domain.IDomainEvent<TodoEntity> {
  public aggregateId: string;
  public metadata: any;

  constructor(public readonly data: TodoEntity, uuid?: string) {
    this.metadata = {
      fromContextId: 'Todo',
    };
    if (uuid) {
      this.metadata.id = uuid;
    }
    this.aggregateId = data.id.toString();
  }
}
