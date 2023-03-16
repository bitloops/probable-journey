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

export class TodoCompletedIntegrationEvent extends Infra.EventBus
  .IntegrationEvent<IntegrationSchemas> {
  static versions = ['v1'];
  public static readonly fromContextId = TodoCompletedDomainEvent.fromContextId; // get from it's own context in case we have some props as input
  static versionMappers: Record<string, ToIntegrationDataMapper> = {
    v1: TodoCompletedIntegrationEvent.toIntegrationDataV1,
  };

  constructor(data: IntegrationSchemas, version: string, uuid?: string) {
    const metadata = {
      id: uuid,
      fromContextId: TodoCompletedIntegrationEvent.fromContextId,
      version,
    };
    super(TodoCompletedIntegrationEvent.getEventTopic(version), data, metadata);
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
    data: TodoCompletedDomainEvent,
  ): IntegrationSchemaV1 {
    return {
      todoId: data.todo.id.toString(),
      userId: data.todo.userId.toString(),
    };
  }

  static getEventTopic(version?: string) {
    const topic = `integration.${TodoCompletedIntegrationEvent.name}`;

    const eventTopic = version === undefined ? topic : `${topic}.${version}`;
    return eventTopic;
  }
}
