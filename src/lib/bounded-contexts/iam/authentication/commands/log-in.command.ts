import { Application, Domain } from '@bitloops/bl-boilerplate-core';
import { asyncLocalStorage } from '@src/bitloops/tracing';
export type TLogInCommand = {
  userId: string;
};
export class LogInCommand extends Application.Command {
  public readonly userId: string;
  public metadata: Application.TCommandMetadata = {
    boundedContextId: 'IAM',
    createdTimestamp: Date.now(),
    messageId: new Domain.UUIDv4().toString(),
    context: asyncLocalStorage.getStore()?.get('context'),
    correlationId: asyncLocalStorage.getStore()?.get('correlationId'),
  };
  constructor(loginCommand: TLogInCommand) {
    super();
    this.userId = loginCommand.userId;
  }
}
