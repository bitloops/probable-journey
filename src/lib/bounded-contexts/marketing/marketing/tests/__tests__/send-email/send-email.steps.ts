import { ContextBuilder } from '../../builders/context.builder';

import { UserEmailReadModelBuilder } from '../../builders/user-read-model.builder';
import { Application } from '@src/bitloops/bl-boilerplate-core';
import { SEND_EMAIL_SUCCESS_CASE } from './send-email.mock';
import { SendEmailCommand } from '@src/lib/bounded-contexts/marketing/marketing/commands/send-email.command';
import { MockEmailService } from './send-email-service-port.mock';
import { SendEmailCommandHandler } from '@src/lib/bounded-contexts/marketing/marketing/application/command-handlers/send-email.command-handler';

describe('Send email feature test', () => {
  it('Sent email successfully,', async () => {
    const { userId, sendCommand } = SEND_EMAIL_SUCCESS_CASE;
    // given
    const mockEmailService = new MockEmailService();
    const ctx = new ContextBuilder().withUserId(userId).build();
    const sendEmailCommand = new SendEmailCommand(sendCommand, ctx);

    // when
    const sendEmailHandler = new SendEmailCommandHandler(
      mockEmailService.getMockMarketingService(),
    );
    const result = await sendEmailHandler.execute(sendEmailCommand);

    //then

    expect(mockEmailService.mockSendMethod).toHaveBeenCalledWith(
      sendCommand,
      ctx,
    );
    expect(typeof result.value).toBe('undefined');
  });
});
