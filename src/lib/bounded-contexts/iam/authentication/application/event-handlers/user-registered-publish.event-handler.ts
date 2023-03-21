import { Infra, Application } from '@bitloops/bl-boilerplate-core';
import { Inject } from '@nestjs/common';
import { BUSES_TOKENS } from '@src/bitloops/nest-jetstream';
import { UserRegisteredIntegrationEvent } from '../../contracts/integration-events/user-registered.integration-event';
import { UserRegisteredDomainEvent } from '../../domain/events/user-registered.event';

export class UserRegisteredPublishIntegrationEventHandler
  implements Application.IHandle
{
  constructor(
    @Inject(BUSES_TOKENS.STREAMING_INTEGRATION_EVENT_BUS)
    private readonly integrationEventBus: Infra.EventBus.IEventBus,
  ) {}

  get event() {
    return UserRegisteredDomainEvent;
  }

  get boundedContext(): string {
    return 'IAM';
  }

  public async handle(event: UserRegisteredDomainEvent): Promise<void> {
    const events = UserRegisteredIntegrationEvent.create(event);
    await this.integrationEventBus.publish(events);

    console.log(
      `[UserRegisteredIntegrationEvent]: Successfully published UserRegisteredIntegrationEvent`,
    );
  }
}
