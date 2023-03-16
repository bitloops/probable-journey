import { Application } from '@bitloops/bl-boilerplate-core';
export type TSendEmailCommand = {
  destination: string;
  origin: string;
  content: string;
};
export class SendEmailCommand extends Application.Command {
  public readonly destination: string;
  public readonly origin: string;
  public readonly content: string;
  public static readonly commandName = 'Marketing.SEND_EMAIL';
  constructor(sendEmail: TSendEmailCommand) {
    super(SendEmailCommand.commandName, 'Marketing');
    this.destination = sendEmail.destination;
    this.origin = sendEmail.origin;
    this.content = sendEmail.content;
  }
  static getCommandTopic(): string {
    return super.getCommandTopic(SendEmailCommand.commandName, 'Marketing');
  }
}