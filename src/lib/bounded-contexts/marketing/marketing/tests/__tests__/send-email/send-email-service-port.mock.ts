import { Application, Either, ok, fail } from '@bitloops/bl-boilerplate-core';
import {
  EmailServicePort,
  SendEmailRequest,
} from '@src/lib/bounded-contexts/marketing/marketing/ports/email-service-port';

export class MockEmailService {
  public readonly mockSendMethod: jest.Mock;
  private mockEmailServicePort: EmailServicePort;

  constructor() {
    this.mockSendMethod = this.getMockSaveMethod();
    this.mockEmailServicePort = {
      send: this.mockSendMethod,
    };
  }

  getMockMarketingService(): EmailServicePort {
    return this.mockEmailServicePort;
  }

  private getMockSaveMethod(): jest.Mock {
    return jest.fn(
      (
        emailRequest: SendEmailRequest,
      ): Promise<Either<void, Application.Repo.Errors.Unexpected>> => {
        return Promise.resolve(ok());
      },
    );
  }
}
