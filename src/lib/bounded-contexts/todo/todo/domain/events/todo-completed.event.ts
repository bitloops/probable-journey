import { Domain } from '@bitloops/bl-boilerplate-core';
import { TodoEntity } from '../TodoEntity';

export class TodoCompletedDomainEvent
  implements Domain.IDomainEvent<TodoEntity>
{
  public aggregateId: string;
  public metadata: any;

  constructor(
    public readonly data: TodoEntity,
    // @CHANGED HERE
    ack?: () => Promise<void>,
    uuid?: string,
  ) {
    this.metadata = {
      fromContextId: 'Todo',
      // @CHANGED HERE
      ack,
      id: uuid,
    };
    this.aggregateId = data.id.toString();
  }
}
