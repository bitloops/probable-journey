import { Application } from '@bitloops/bl-boilerplate-core';
export type TLogInCommand = {
  userId: string;
};
export class LogInCommand extends Application.Command {
  public readonly userId: string;
  public static readonly commandName = 'IAM.LOGIN_USER';
  constructor(loginCommand: LogInCommand) {
    super(LogInCommand.commandName, 'IAM');
    this.userId = loginCommand.userId;
  }
  static getCommandTopic(): string {
    return super.getCommandTopic(LogInCommand.commandName, 'IAM');
  }
}
