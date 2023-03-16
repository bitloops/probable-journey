import { Infra } from '@bitloops/bl-boilerplate-core';
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
  public static readonly fromContextId = 'Todo'; // TodoCompletedDomainEvent.fromContextId; // get from it's own context in case we have some props as input
  static versionMappers: Record<string, ToIntegrationDataMapper> = {
    v1: TodoCompletedIntegrationEvent.toIntegrationDataV1,
  };
  public metadata: any;

  constructor(public data: IntegrationSchemas, version: string, uuid?: string) {
    this.metadata = {
      id: uuid,
      fromContextId: TodoCompletedIntegrationEvent.fromContextId,
      version,
    };
    // super(TodoCompletedIntegrationEvent.getEventTopic(version), data, metadata);
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

  static getEventTopic(version?: string) {
    const topic = `integration.${TodoCompletedIntegrationEvent.name}`;

    const eventTopic = version === undefined ? topic : `${topic}.${version}`;
    return eventTopic;
  }
}
