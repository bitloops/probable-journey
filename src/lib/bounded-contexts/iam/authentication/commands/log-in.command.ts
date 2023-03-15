import { Application } from '@bitloops/bl-boilerplate-core';
export type TLogInCommand = {
  email: string;
  password: string;
};
export class LogInCommand extends Application.Command {
  public readonly email: string;
  public readonly password: string;
  public static readonly commandName = 'IAM.ADD_TODO';
  constructor(loginCommand: LogInCommand) {
    super(LogInCommand.commandName, 'IAM');
    this.email = loginCommand.email;
    this.password = loginCommand.password;
  }
  static getCommandTopic(): string {
    return super.getCommandTopic(LogInCommand.commandName, 'IAM');
  }
}
