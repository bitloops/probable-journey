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
  public readonly metadata: Application.TCommandMetadata = {
    toContextId: 'Marketing',
    createdTimestamp: Date.now(),
  };
  constructor(
    sendEmail: TSendEmailCommand,
    public readonly ctx?: Application.TContext,
  ) {
    super();
    this.destination = sendEmail.destination;
    this.origin = sendEmail.origin;
    this.content = sendEmail.content;
  }
}
