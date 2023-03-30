import { Application, Domain } from '@bitloops/bl-boilerplate-core';
import { asyncLocalStorage } from '@bitloops/bl-boilerplate-infra-telemetry';
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
    boundedContextId: 'Marketing',
    createdTimestamp: Date.now(),
    messageId: new Domain.UUIDv4().toString(),
    context: asyncLocalStorage.getStore()?.get('context'),
    correlationId: asyncLocalStorage.getStore()?.get('correlationId'),
  };
  constructor(sendEmail: TSendEmailCommand) {
    super();
    this.destination = sendEmail.destination;
    this.origin = sendEmail.origin;
    this.content = sendEmail.content;
  }
}
