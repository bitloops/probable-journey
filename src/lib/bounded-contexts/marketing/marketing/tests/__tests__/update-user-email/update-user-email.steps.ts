import {
  UPDATE_USER_REPO_ERROR_CASE,
  UPDATE_USER_SUCCESS_CASE,
} from './update-user-email.mock';
import { UserEmailReadModelBuilder } from '../../builders/user-read-model.builder';
import { Application } from '@src/bitloops/bl-boilerplate-core';
import { MockUpdateUserReadRepo } from './update-user-email-read-repo.mock.ts';
import { UpdateUserEmailCommand } from '@src/lib/bounded-contexts/marketing/marketing/commands/update-user-email.command';
import { UpdateUserEmailCommandHandler } from '@src/lib/bounded-contexts/marketing/marketing/application/command-handlers/update-user-email.command-handler';
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

describe('Create user feature test', () => {
  it('Created user successfully,', async () => {
    const { email, userId } = UPDATE_USER_SUCCESS_CASE;
    mockAsyncLocalStorageGet(userId);
    // given
    const mockUpdateUserReadRepo = new MockUpdateUserReadRepo();
    const updateUserEmailCommand = new UpdateUserEmailCommand({
      email,
      userId,
    });

    // when
    const updateUserEmailHandler = new UpdateUserEmailCommandHandler(
      mockUpdateUserReadRepo.getMockMarketingReadRepo(),
    );
    const result = await updateUserEmailHandler.execute(updateUserEmailCommand);

    //then
    const userIdEmail = new UserEmailReadModelBuilder()
      .withUserId(userId)
      .withEmail(email)
      .build();

    expect(mockUpdateUserReadRepo.mockSaveMethod).toHaveBeenCalledWith({
      userId,
      email,
    });
    const userAggregate =
      mockUpdateUserReadRepo.mockSaveMethod.mock.calls[0][0];
    expect(userAggregate).toEqual(userIdEmail);
    expect(typeof result.value).toBe('undefined');
  });
  it('Created user failed, repo error', async () => {
    const { email, userId } = UPDATE_USER_REPO_ERROR_CASE;
    // given
    const mockUpdateUserReadRepo = new MockUpdateUserReadRepo();
    mockAsyncLocalStorageGet(userId);
    const updateUserEmailCommand = new UpdateUserEmailCommand({
      email,
      userId,
    });

    // when
    const updateUserEmailHandler = new UpdateUserEmailCommandHandler(
      mockUpdateUserReadRepo.getMockMarketingReadRepo(),
    );
    const result = await updateUserEmailHandler.execute(updateUserEmailCommand);

    //then
    const userIdEmail = new UserEmailReadModelBuilder()
      .withUserId(userId)
      .withEmail(email)
      .build();

    expect(mockUpdateUserReadRepo.mockSaveMethod).toHaveBeenCalledWith(
      userIdEmail,
    );
    expect(result.value).toBeInstanceOf(Application.Repo.Errors.Unexpected);
  });
});
