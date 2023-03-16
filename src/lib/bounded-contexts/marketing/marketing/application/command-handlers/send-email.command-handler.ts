import {
  Application,
  Either,
  ok,
} from '@bitloops/bl-boilerplate-core';
import { CommandHandler } from '@nestjs/cqrs';
import { SendEmailCommand } from '../../commands/send-email.command';
import { Inject } from '@nestjs/common';
import { EmailServicePort, EmailServicePortToken } from '../../ports/email-service-port';

type SendEmailCommandHandlerResponse = Either<void, void>;

@CommandHandler(SendEmailCommand)
export class SendEmailCommandHandler
  implements
  Application.IUseCase<
    SendEmailCommand,
    Promise<SendEmailCommandHandlerResponse>
  >
{
  constructor(
    @Inject(EmailServicePortToken)
    private readonly emailService: EmailServicePort,
  ) { }

  async execute(
    command: SendEmailCommand,
  ): Promise<SendEmailCommandHandlerResponse> {
    console.log('SendEmailHandler');
    await this.emailService.send({
      origin: command.origin,
      destination: command.destination,
      content: command.content
    })
    return ok();
  }
}
