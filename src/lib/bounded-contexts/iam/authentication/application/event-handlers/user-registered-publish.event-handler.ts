import { Infra, Application } from '@bitloops/bl-boilerplate-core';
import { UserRegisteredIntegrationEvent } from '../../contracts/integration-events/user-registered.integration-event';
import { UserRegisteredDomainEvent } from '../../domain/events/user-registered.event';

export class UserRegisteredPublishIntegrationEventHandler
  implements Application.IHandle
{
  private eventBus: Infra.EventBus.IEventBus;
  // constructor() {}
  get event() {
    return UserRegisteredDomainEvent;
  }

  get boundedContext(): string {
    return 'Iam';
  }

  public async handle(event: UserRegisteredDomainEvent): Promise<void> {
    const events = UserRegisteredIntegrationEvent.create(event);
    await this.eventBus.publish(events);

    console.log(
      `[UserRegisteredIntegrationEvent]: Successfully published UserRegisteredIntegrationEvent`,
    );
  }
}
