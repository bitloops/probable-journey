import { Infra, Application } from '@src/bitloops/bl-boilerplate-core';
import { UpdateUserEmailCommand } from '../../../commands/update-user-email.command';

export class UserRegisteredIntegrationEventHandler
  implements Application.IHandle
{
  constructor(private commandBus: Infra.CommandBus.IPubSubCommandBus) {}

  public async handle(
    event: any /*UserRegisteredIntegrationEvent*/,
  ): Promise<void> {
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
