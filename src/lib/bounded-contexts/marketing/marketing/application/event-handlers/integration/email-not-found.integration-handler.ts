import { Infra, Application } from '@src/bitloops/bl-boilerplate-core';
import { EmailNotFoundIntegrationErrorEvent } from '@src/lib/bounded-contexts/iam/authentication/application/error-events/email-not-found.integration-event';

export class EmailNotFoundIntegrationErrorEventHandler
  implements Application.IHandle
{
  constructor(private integrationEventBus: Infra.EventBus.IEventBus) {}

  get event() {
    return EmailNotFoundIntegrationErrorEvent;
  }

  get boundedContext() {
    return 'Marketing';
  }

  public async handle(
    event: EmailNotFoundIntegrationErrorEvent,
  ): Promise<void> {
    const { data } = event;
    console.log(
      'data received from EmailNotFoundIntegrationErrorEventHandler',
      data,
    );

    console.log(
      `[EmailNotFounIntegrationErrorEvent]: Successfully sent EmailNotFoundCommand`,
    );
  }
}