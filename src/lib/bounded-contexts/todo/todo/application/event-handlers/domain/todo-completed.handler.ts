import { Infra, Application } from '@bitloops/bl-boilerplate-core';
import { TodoCompletedDomainEvent } from '../../../domain/events/todo-completed.event';
import { TodoCompletedIntegrationEvent } from '../../../integration-events/todo-completed.integration-event';

export class TodoCompletedDomainToIntegrationEventHandler
  implements Application.IHandle
{
  private eventBus: Infra.EventBus.IEventBus;
  constructor() {
    // this.eventBus =
  }

  public async handle(event: TodoCompletedDomainEvent): Promise<void> {
    const events = TodoCompletedIntegrationEvent.create(event);

    await this.eventBus.publishMany(events);

    console.log(
      `[TodoCompletedDomainEventHandler]: Successfully published TodoCompletedIntegrationEvent`,
    );
  }
}
