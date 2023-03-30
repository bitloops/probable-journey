import { mockAsyncLocalStorageGet } from '../../../../../../../../test/mocks/mockAsynLocalStorageGet.mock';
import { Application, Domain } from '@src/bitloops/bl-boilerplate-core';
import {
  CHANGE_EMAIL_SUCCESS_CASE,
  INVALID_EMAIL_CASE,
  USER_NOT_FOUND_CASE,
  USER_REPO_ERROR_GETBYID_CASE,
  USER_REPO_ERROR_UPDATE_CASE,
} from './change-email.mock';
import { MockUserWriteRepo } from './change-email-write-repo.mock';
import { ChangeEmailCommand } from '../../../commands/change-email.command';
import { ChangeEmailHandler } from '../../../application/command-handlers/change-email.handler';
import { UserEntityBuilder } from '../../builders/user-entity.builder';
import { UserEntity } from '../../../domain/UserEntity';
import { DomainErrors } from '../../../domain/errors';
import { ApplicationErrors } from '../../../application/errors';

const mockGet = jest.fn();
jest.mock('@bitloops/tracing', () => ({
  Traceable: () => jest.fn(),

  asyncLocalStorage: {
    getStore: jest.fn(() => ({
      get: mockGet,
    })),
  },
}));

describe('Change user email feature test', () => {
  it('Changed user email successfully', async () => {
    const { id, email, password } = CHANGE_EMAIL_SUCCESS_CASE;
    mockAsyncLocalStorageGet(id);

    // given
    const mockUserWriteRepo = new MockUserWriteRepo();
    const changeEmailCommand = new ChangeEmailCommand({
      email,
      userId: id,
    });

    // when
    const changeEmailHandler = new ChangeEmailHandler(
      mockUserWriteRepo.getMockUserWriteRepo(),
    );
    const result = await changeEmailHandler.execute(changeEmailCommand);

    //then
    const userEntity = new UserEntityBuilder()
      .withId(id)
      .withEmail(email)
      .withPassword(password)
      .build();

    expect(mockUserWriteRepo.mockGetByIdMethod).toHaveBeenCalledWith(
      new Domain.UUIDv4(id),
    );
    expect(mockUserWriteRepo.mockUpdateMethod).toHaveBeenCalledWith(
      expect.any(UserEntity),
    );
    const userAggregate = mockUserWriteRepo.mockUpdateMethod.mock.calls[0][0];
    expect(userAggregate.id).toEqual(userEntity.id);
    expect(userAggregate.email).toEqual(userEntity.email);
    expect(userAggregate.password).toEqual(userEntity.password);
    expect(result.value).toBe(undefined);
  });
  it('Changed user email failed, invalid email', async () => {
    const { id, email } = INVALID_EMAIL_CASE;
    mockAsyncLocalStorageGet(id);

    // given
    const mockUserWriteRepo = new MockUserWriteRepo();
    const changeEmailCommand = new ChangeEmailCommand({
      email,
      userId: id,
    });

    // when
    const changeEmailHandler = new ChangeEmailHandler(
      mockUserWriteRepo.getMockUserWriteRepo(),
    );
    const result = await changeEmailHandler.execute(changeEmailCommand);

    //then

    expect(result.value).toBeInstanceOf(DomainErrors.InvalidEmailDomainError);
  });
  it('Changed user email failed, getById user repo error', async () => {
    const { id, email } = USER_REPO_ERROR_GETBYID_CASE;
    mockAsyncLocalStorageGet(id);

    // given
    const mockUserWriteRepo = new MockUserWriteRepo();
    const changeEmailCommand = new ChangeEmailCommand({
      email,
      userId: id,
    });

    // when
    const changeEmailHandler = new ChangeEmailHandler(
      mockUserWriteRepo.getMockUserWriteRepo(),
    );
    const result = await changeEmailHandler.execute(changeEmailCommand);

    //then

    expect(mockUserWriteRepo.mockGetByIdMethod).toHaveBeenCalledWith(
      new Domain.UUIDv4(id),
    );
    expect(result.value).toBeInstanceOf(Application.Repo.Errors.Unexpected);
  });
  it('Changed user email failed, user not found', async () => {
    const { id, email } = USER_NOT_FOUND_CASE;
    mockAsyncLocalStorageGet(id);

    // given
    const mockUserWriteRepo = new MockUserWriteRepo();
    const changeEmailCommand = new ChangeEmailCommand({
      email,
      userId: id,
    });

    // when
    const changeEmailHandler = new ChangeEmailHandler(
      mockUserWriteRepo.getMockUserWriteRepo(),
    );
    const result = await changeEmailHandler.execute(changeEmailCommand);

    //then

    expect(mockUserWriteRepo.mockGetByIdMethod).toHaveBeenCalledWith(
      new Domain.UUIDv4(id),
    );
    expect(result.value).toBeInstanceOf(
      ApplicationErrors.UserNotFoundApplicationError,
    );
  });
  it('Changed user email failed, update user repo error', async () => {
    const { id, email, password } = USER_REPO_ERROR_UPDATE_CASE;
    mockAsyncLocalStorageGet(id);

    // given
    const mockUserWriteRepo = new MockUserWriteRepo();
    const changeEmailCommand = new ChangeEmailCommand({
      email,
      userId: id,
    });

    // when
    const changeEmailHandler = new ChangeEmailHandler(
      mockUserWriteRepo.getMockUserWriteRepo(),
    );
    const result = await changeEmailHandler.execute(changeEmailCommand);

    //then
    const userEntity = new UserEntityBuilder()
      .withId(id)
      .withEmail(email)
      .withPassword(password)
      .build();

    expect(mockUserWriteRepo.mockGetByIdMethod).toHaveBeenCalledWith(
      new Domain.UUIDv4(id),
    );
    expect(mockUserWriteRepo.mockUpdateMethod).toHaveBeenCalledWith(
      expect.any(UserEntity),
    );
    const userAggregate = mockUserWriteRepo.mockUpdateMethod.mock.calls[0][0];
    expect(userAggregate.id).toEqual(userEntity.id);
    expect(userAggregate.email).toEqual(userEntity.email);
    expect(userAggregate.password).toEqual(userEntity.password);
    expect(result.value).toBeInstanceOf(Application.Repo.Errors.Unexpected);
  });
});
