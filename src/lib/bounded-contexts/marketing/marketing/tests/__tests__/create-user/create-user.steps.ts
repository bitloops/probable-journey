import { ContextBuilder } from '../../builders/context.builder';
import {
  CREATE_USER_REPO_ERROR_CASE,
  CREATE_USER_SUCCESS_CASE,
} from './create-user.mock';
import { CreateUserCommand } from '@src/lib/bounded-contexts/marketing/marketing/commands/create-user.command';
import { MockCreateUserReadRepo } from './create-user-read-repo.mock';
import { CreateUserCommandHandler } from '@src/lib/bounded-contexts/marketing/marketing/application/command-handlers/create-user.command-handler';
import { UserEmailReadModelBuilder } from '../../builders/user-read-model.builder';
import { Application } from '@src/bitloops/bl-boilerplate-core';

describe('Create user feature test', () => {
  it('Created user successfully,', async () => {
    const { email, userId } = CREATE_USER_SUCCESS_CASE;
    // given
    const mockCreateUserReadRepo = new MockCreateUserReadRepo();
    const ctx = new ContextBuilder().withUserId(userId).build();
    const createUserCommand = new CreateUserCommand({ email, userId }, ctx);

    // when
    const createUserHandler = new CreateUserCommandHandler(
      mockCreateUserReadRepo.getMockMarketingReadRepo(),
    );
    const result = await createUserHandler.execute(createUserCommand);

    //then
    const userIdEmail = new UserEmailReadModelBuilder()
      .withUserId(userId)
      .withEmail(email)
      .build();

    expect(mockCreateUserReadRepo.mockCreateMethod).toHaveBeenCalledWith(
      { userId, email },
      ctx,
    );
    const userAggregate =
      mockCreateUserReadRepo.mockCreateMethod.mock.calls[0][0];
    expect(userAggregate).toEqual(userIdEmail);
    expect(typeof result.value).toBe('undefined');
  });
  it('Created user failed, repo error', async () => {
    const { email, userId } = CREATE_USER_REPO_ERROR_CASE;
    // given
    const mockCreateUserReadRepo = new MockCreateUserReadRepo();
    const ctx = new ContextBuilder().withUserId(userId).build();
    const createUserCommand = new CreateUserCommand({ email, userId }, ctx);

    // when
    const createUserHandler = new CreateUserCommandHandler(
      mockCreateUserReadRepo.getMockMarketingReadRepo(),
    );
    const result = await createUserHandler.execute(createUserCommand);

    //then
    const userIdEmail = new UserEmailReadModelBuilder()
      .withUserId(userId)
      .withEmail(email)
      .build();

    expect(mockCreateUserReadRepo.mockCreateMethod).toHaveBeenCalledWith(
      userIdEmail,
      ctx,
    );
    expect(result.value).toBeInstanceOf(Application.Repo.Errors.Unexpected);
  });
});
