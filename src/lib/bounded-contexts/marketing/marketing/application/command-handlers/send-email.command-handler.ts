import { Application, Either, ok } from '@bitloops/bl-boilerplate-core';
import { SendEmailCommand } from '../../commands/send-email.command';
import { Inject } from '@nestjs/common';
import { EmailServicePort } from '../../ports/email-service-port';
import { EmailServicePortToken } from '../../constants';

type SendEmailCommandHandlerResponse = Either<void, void>;

export class SendEmailCommandHandler
  implements
    Application.ICommandHandler<
      SendEmailCommand,
      Promise<SendEmailCommandHandlerResponse>
    >
{
  constructor(
    @Inject(EmailServicePortToken)
    private readonly emailService: EmailServicePort,
  ) {}

  get command() {
    return SendEmailCommand;
  }

  get boundedContext(): string {
    return 'Marketing';
  }

  async execute(
    command: SendEmailCommand,
  ): Promise<SendEmailCommandHandlerResponse> {
    console.log('SendEmailHandler');
    await this.emailService.send({
      origin: command.origin,
      destination: command.destination,
      content: command.content,
    });
    return ok();
  }
}
