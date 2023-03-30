import { Inject } from '@nestjs/common';
import { Infra, Application, Either, ok } from '@bitloops/bl-boilerplate-core';
import { UserRegisteredIntegrationEvent } from '@bitloops/bl-boilerplate-infra-nest-auth-passport';
import { CreateUserCommand } from '../../../commands/create-user.command';
import { StreamingCommandBusToken } from '../../../constants';

export class UserRegisteredIntegrationEventHandler
  implements Application.IHandleIntegrationEvent
{
  constructor(
    @Inject(StreamingCommandBusToken)
    private commandBus: Infra.CommandBus.IStreamCommandBus,
  ) {}

  get event() {
    return UserRegisteredIntegrationEvent;
  }

  get boundedContext() {
    return UserRegisteredIntegrationEvent.boundedContextId;
  }

  get version() {
    return UserRegisteredIntegrationEvent.versions[0]; // here output will be 'v1'
  }

  public async handle(
    event: UserRegisteredIntegrationEvent,
  ): Promise<Either<void, never>> {
    const { data } = event;
    const command = new CreateUserCommand({
      userId: data.userId,
      email: data.email,
    });
    await this.commandBus.publish(command);

    console.log(
      `[UserRegisteredIntegrationEvent]: Successfully sent CreateUserCommand`,
    );
    return ok();
  }
}
