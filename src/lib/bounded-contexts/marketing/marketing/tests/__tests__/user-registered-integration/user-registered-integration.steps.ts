import { UserRegisteredIntegrationEvent } from '@src/bitloops/nest-auth-passport';
import { mockAsyncLocalStorageGet } from '../../../../../../../../test/mocks/mockAsynLocalStorageGet.mock';
import { UserRegisteredIntegrationEventHandler } from '../../../application/event-handlers/integration/user-registered.integration-handler';
import { MockStreamCommandBus } from './stream-command-bus.mock';
import { SUCCESS_CASE } from './user-registered-integration.mock';

const mockGet = jest.fn();
jest.mock('@bitloops/tracing', () => ({
  Traceable: () => jest.fn(),

  asyncLocalStorage: {
    getStore: jest.fn(() => ({
      get: mockGet,
    })),
  },
}));

describe('UserRegisteredIntegrationEvent feature test', () => {
  it('Sent CreateUserCommand successfully', async () => {
    const { userId, email } = SUCCESS_CASE;
    mockAsyncLocalStorageGet(userId);

    //given
    const mockStreamCommandBus = new MockStreamCommandBus();

    //when
    const userRegisteredIntegrationEventHandler =
      new UserRegisteredIntegrationEventHandler(
        mockStreamCommandBus.getMockStreamCommandBus(),
      );
    const userRegisteredIntegrationEvent = new UserRegisteredIntegrationEvent({
      userId,
      email,
    });
    const result = await userRegisteredIntegrationEventHandler.handle(
      userRegisteredIntegrationEvent,
    );

    //then
    expect(mockStreamCommandBus.mockPublish).toHaveBeenCalled();
    const publishedCommand = mockStreamCommandBus.mockPublish.mock.calls[0][0];
    expect(publishedCommand.userId).toEqual(userId);
    expect(publishedCommand.email).toEqual(email);
    expect(result.value).toBe(undefined);
  });
});
