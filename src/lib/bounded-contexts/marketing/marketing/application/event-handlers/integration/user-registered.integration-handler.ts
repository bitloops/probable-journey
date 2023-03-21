import { Inject } from '@nestjs/common';
import { Infra, Application } from '@src/bitloops/bl-boilerplate-core';
import { UserRegisteredIntegrationEvent } from '@src/lib/bounded-contexts/iam/authentication/contracts/integration-events/user-registered.integration-event';
import { CreateUserCommand } from '../../../commands/create-user.command';
import { StreamingCommandBusToken } from '../../../constants';

export class UserRegisteredIntegrationEventHandler
  implements Application.IHandle
{
  constructor(
    @Inject(StreamingCommandBusToken)
    private commandBus: Infra.CommandBus.IPubSubCommandBus,
  ) {}

  get event() {
    return UserRegisteredIntegrationEvent;
  }

  get boundedContext() {
    return 'IAM';
  }

  public async handle(event: UserRegisteredIntegrationEvent): Promise<void> {
    const { data } = event;
    const command = new CreateUserCommand({
      userId: data.userId,
      email: data.email,
    });
    await this.commandBus.publish(command);

    console.log(
      `[UserRegisteredIntegrationEvent]: Successfully sent CreateUserCommand`,
    );
  }
}
