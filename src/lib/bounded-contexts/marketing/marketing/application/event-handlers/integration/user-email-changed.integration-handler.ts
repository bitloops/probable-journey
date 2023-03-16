// import { Infra, Application } from '@src/bitloops/bl-boilerplate-core';
// import { UpdateUserEmailCommand } from '../../../commands/update-user-email.command';

// export class UserEmailChangedIntegrationEventHandler
//   implements Application.IHandle
// {
//   constructor(private commandBus: Infra.CommandBus.IPubSubCommandBus) {}

//   public async handle(event: UserEmailChangedIntegrationEvent): Promise<void> {
//     const { data } = event;
//     const command = new UpdateUserEmailCommand({
//       userId: data.userId,
//       email: data.email,
//     });
//     await this.commandBus.send(command);

//     console.log(
//       `[UserEmailChangedIntegrationEvent]: Successfully sent UpdateUserEmail`,
//     );
//   }
// }
