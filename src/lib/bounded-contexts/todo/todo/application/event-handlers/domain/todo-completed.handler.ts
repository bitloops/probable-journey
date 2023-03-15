import { Infra, Application } from '@bitloops/bl-boilerplate-core';
import { TodoCompletedDomainEvent } from '../../../domain/events/todo-completed.event';
import { TodoCompletedIntegrationEvent } from '../../../contracts/integration-events/todo-completed.integration-event';

export class TodoCompletedDomainToIntegrationEventHandler
  implements Application.IHandle
{
  private eventBus: Infra.EventBus.IEventBus;
  constructor() {}

  public async handle(event: TodoCompletedDomainEvent): Promise<void> {
    const events = TodoCompletedIntegrationEvent.create(event);

    await this.eventBus.publishMany(events);

    console.log(
      `[TodoCompletedDomainEventHandler]: Successfully published TodoCompletedIntegrationEvent`,
    );
  }
}
