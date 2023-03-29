import { Application, Either, ok } from '@bitloops/bl-boilerplate-core';
import { SendEmailCommand } from '../../commands/send-email.command';
import { Inject } from '@nestjs/common';
import { EmailServicePort } from '../../ports/email-service-port';
import { EmailServicePortToken } from '../../constants';
import { Traceable } from '@src/bitloops/tracing';

type SendEmailCommandHandlerResponse = Either<void, never>;

export class SendEmailCommandHandler
  implements Application.ICommandHandler<SendEmailCommand, void>
{
  private ctx?: Application.TContext;
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

  @Traceable({
    operation: 'SendEmailCommandHandler',
    metrics: {
      name: 'SendEmailCommandHandler',
      category: 'commandHandler',
    },
  })
  async execute(
    command: SendEmailCommand,
  ): Promise<SendEmailCommandHandlerResponse> {
    this.ctx = command.metadata.context!;
    console.log('SendEmailHandler');
    await this.emailService.send(
      {
        origin: command.origin,
        destination: command.destination,
        content: command.content,
      },
      this.ctx,
    );
    return ok();
  }
}
