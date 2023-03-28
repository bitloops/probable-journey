import { Inject } from '@nestjs/common';
import { Infra, Application } from '@src/bitloops/bl-boilerplate-core';
import { UserRegisteredIntegrationEvent } from '@src/bitloops/nest-auth-passport';
import { CreateUserCommand } from '../../../commands/create-user.command';
import { StreamingCommandBusToken } from '../../../constants';

export class UserRegisteredIntegrationEventHandler
  implements Application.IHandleIntegrationEvent
{
  constructor(
    @Inject(StreamingCommandBusToken)
    private commandBus: Infra.CommandBus.IPubSubCommandBus,
  ) {}

  get event() {
    return UserRegisteredIntegrationEvent;
  }

  get boundedContext() {
    return UserRegisteredIntegrationEvent.fromContextId;
  }

  get version() {
    return UserRegisteredIntegrationEvent.versions[0];
  }

  public async handle(event: UserRegisteredIntegrationEvent): Promise<void> {
    const { data, metadata } = event;
    const command = new CreateUserCommand(
      {
        userId: data.userId,
        email: data.email,
      },
      metadata.ctx,
    );
    await this.commandBus.publish(command);

    console.log(
      `[UserRegisteredIntegrationEvent]: Successfully sent CreateUserCommand`,
    );
  }
}
