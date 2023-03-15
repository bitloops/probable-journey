import { Application } from '@bitloops/bl-boilerplate-core';
export type TSendEmailCommand = {
  email: string;
};
export class SendEmailCommand extends Application.Command {
  public readonly email: string;
  public static readonly commandName = 'Marketing.SEND_EMAIL';
  constructor(sendEmail: TSendEmailCommand) {
    super(SendEmailCommand.commandName, 'Marketing');
    this.email = sendEmail.email;
  }
  static getCommandTopic(): string {
    return super.getCommandTopic(SendEmailCommand.commandName, 'Marketing');
  }
}