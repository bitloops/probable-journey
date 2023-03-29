import { Infra, Application, Either, ok } from '@bitloops/bl-boilerplate-core';
import { Inject } from '@nestjs/common';
import { StreamingIntegrationEventBusToken } from '../../constants';
import { UserUpdatedEmailIntegrationEvent } from '../../contracts/integration-events/user-updated-email.integration-event';
import { UserUpdatedEmailDomainEvent } from '../../domain/events/user-updated-email.event';

export class UserUpdatedEmailPublishIntegrationEventHandler
  implements Application.IHandleDomainEvent
{
  constructor(
    @Inject(StreamingIntegrationEventBusToken)
    private eventBus: Infra.EventBus.IEventBus,
  ) {}

  get event() {
    return UserUpdatedEmailDomainEvent;
  }

  get boundedContext(): string {
    return 'IAM';
  }

  public async handle(
    event: UserUpdatedEmailDomainEvent,
  ): Promise<Either<void, never>> {
    const events = UserUpdatedEmailIntegrationEvent.create(event);
    await this.eventBus.publish(events);

    console.log(
      `[UserUpdatedEmailPublishIntegrationEventHandler]: Successfully published UserUpdatedEmailIntegrationEvent`,
    );
    return ok();
  }
}
