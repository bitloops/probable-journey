import { SEND_EMAIL_SUCCESS_CASE } from './send-email.mock';
import { SendEmailCommand } from '@src/lib/bounded-contexts/marketing/marketing/commands/send-email.command';
import { MockEmailService } from './send-email-service-port.mock';
import { SendEmailCommandHandler } from '@src/lib/bounded-contexts/marketing/marketing/application/command-handlers/send-email.command-handler';
import { mockAsyncLocalStorageGet } from '../../../../../../../../test/mocks/mockAsynLocalStorageGet.mock';

const mockGet = jest.fn();
jest.mock('@bitloops/tracing', () => ({
  Traceable: () => jest.fn(),

  asyncLocalStorage: {
    getStore: jest.fn(() => ({
      get: mockGet,
    })),
  },
}));

describe('Send email feature test', () => {
  it('Sent email successfully,', async () => {
    const { userId, sendCommand } = SEND_EMAIL_SUCCESS_CASE;
    mockAsyncLocalStorageGet(userId);
    // given
    const mockEmailService = new MockEmailService();
    const sendEmailCommand = new SendEmailCommand(sendCommand);

    // when
    const sendEmailHandler = new SendEmailCommandHandler(
      mockEmailService.getMockMarketingService(),
    );
    const result = await sendEmailHandler.execute(sendEmailCommand);

    //then

    expect(mockEmailService.mockSendMethod).toHaveBeenCalledWith(sendCommand);
    expect(typeof result.value).toBe('undefined');
  });
});
