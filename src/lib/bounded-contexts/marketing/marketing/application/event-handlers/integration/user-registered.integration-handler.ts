import { Infra, Application } from '@src/bitloops/bl-boilerplate-core';
import { UserRegisteredIntegrationEvent } from '@src/lib/bounded-contexts/iam/authentication/contracts/integration-events/user-registered.integration-event';
import { UpdateUserEmailCommand } from '../../../commands/update-user-email.command';

export class UserRegisteredIntegrationEventHandler
  implements Application.IHandle
{
  constructor(private commandBus: Infra.CommandBus.IPubSubCommandBus) {}

  get event() {
    return UserRegisteredIntegrationEvent;
  }

  get boundedContext() {
    return 'Marketing';
  }

  public async handle(event: UserRegisteredIntegrationEvent): Promise<void> {
    const { data } = event;
    const command = new UpdateUserEmailCommand({
      userId: data.userId,
      email: data.email,
    });
    await this.commandBus.publish(command);

    console.log(
      `[UserRegisteredIntegrationEvent]: Successfully sent UpdateUserEmailCommand`,
    );
  }
}
