import { Injectable } from '@nestjs/common';
import {
  EmailServicePort,
  SendEmailRequest,
} from 'src/lib/bounded-contexts/marketing/marketing/ports/email-service-port';

@Injectable()
export class MockEmailService implements EmailServicePort {
  send(data: SendEmailRequest): void {
    console.log('MockEmailService sending data:', data);
  }
}
