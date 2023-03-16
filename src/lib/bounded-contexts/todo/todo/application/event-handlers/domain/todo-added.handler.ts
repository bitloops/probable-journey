import { Infra, Application } from '@bitloops/bl-boilerplate-core';
import { Inject } from '@nestjs/common';
import { TodoAddedDomainEvent } from '../../../domain/events/todo-added.event';
import { TodoCompletedIntegrationEvent } from '../../../contracts/integration-events/todo-completed.integration-event';
import { StreamingIntegrationEventBusToken } from '../../../constants';

export class TodoAddedDomainToIntegrationEventHandler
  implements Application.IHandle
{
  constructor(
    @Inject(StreamingIntegrationEventBusToken)
    private integrationEventBus: Infra.EventBus.IEventBus,
  ) {}
  get event() {
    return TodoAddedDomainEvent;
  }

  get boundedContext(): string {
    return 'Todo';
  }

  public async handle(event: TodoAddedDomainEvent): Promise<void> {
    const events = TodoCompletedIntegrationEvent.create(event);

    await this.integrationEventBus.publish(events);

    console.log(
      `[TodoAddedDomainEventHandler]: Successfully published TodoAddedIntegrationEvent`,
    );
  }
}
