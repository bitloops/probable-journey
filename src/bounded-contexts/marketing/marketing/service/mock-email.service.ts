import { EmailServicePort, SendEmailRequest } from 'src/lib/bounded-contexts/marketing/marketing/ports/email-service-port';

export class MockEmailService implements EmailServicePort {
  send(data: SendEmailRequest): void {
    console.log('MockEmailService sending data:', data);
  }
}
