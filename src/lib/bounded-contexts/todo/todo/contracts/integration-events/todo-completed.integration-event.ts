import {
  Domain,
  Infra,
  asyncLocalStorage,
} from '@bitloops/bl-boilerplate-core';
import { TodoCompletedDomainEvent } from '../../domain/events/todo-completed.event';

export type IntegrationSchemaV1 = {
  todoId: string;
  userId: string;
};

type IntegrationSchemas = IntegrationSchemaV1;
type ToIntegrationDataMapper = (
  data: TodoCompletedDomainEvent,
) => IntegrationSchemas;

export class TodoCompletedIntegrationEvent
  implements Infra.EventBus.IntegrationEvent<IntegrationSchemas>
{
  static versions = ['v1'];
  public static readonly boundedContextId = 'Todo';
  static versionMappers: Record<string, ToIntegrationDataMapper> = {
    v1: TodoCompletedIntegrationEvent.toIntegrationDataV1,
  };
  public metadata: Infra.EventBus.TIntegrationEventMetadata;

  constructor(public data: IntegrationSchemas, version: string) {
    this.metadata = {
      createdTimestamp: Date.now(),
      boundedContextId: TodoCompletedIntegrationEvent.boundedContextId,
      context: asyncLocalStorage.getStore()?.get('context'),
      messageId: new Domain.UUIDv4().toString(),
      correlationId: asyncLocalStorage.getStore()?.get('correlationId'),
      version,
    };
  }

  static create(
    event: TodoCompletedDomainEvent,
  ): TodoCompletedIntegrationEvent[] {
    return TodoCompletedIntegrationEvent.versions.map((version) => {
      const mapper = TodoCompletedIntegrationEvent.versionMappers[version];
      const data = mapper(event);
      return new TodoCompletedIntegrationEvent(data, version);
    });
  }

  static toIntegrationDataV1(
    event: TodoCompletedDomainEvent,
  ): IntegrationSchemaV1 {
    return {
      todoId: event.data.id.toString(),
      userId: event.data.userId.toString(),
    };
  }
}
