import { Application } from '@bitloops/bl-boilerplate-core';
export type TLogInCommand = {
  userId: string;
};
export class LogInCommand extends Application.Command {
  public readonly userId: string;
  public metadata: Application.TCommandMetadata = {
    toContextId: 'IAM',
    createdTimestamp: Date.now(),
  };
  constructor(loginCommand: LogInCommand) {
    super();
    this.userId = loginCommand.userId;
  }
}
