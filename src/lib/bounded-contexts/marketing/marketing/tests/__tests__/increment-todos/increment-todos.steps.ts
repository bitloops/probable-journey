import { Application, Domain } from '@src/bitloops/bl-boilerplate-core';
import { IncrementTodosCommand } from '@src/lib/bounded-contexts/marketing/marketing/commands/Increment-todos.command';
import { IncrementTodosCommandHandler } from '@src/lib/bounded-contexts/marketing/marketing/application/command-handlers/increment-todos.command-handler';
import { ContextBuilder } from '../../builders/context.builder';
import { UserPropsBuilder } from '../../builders/user-props.builder';
import { MockIncrementCompletedTodosWriteRepo } from './increment-todos-write-repo.mock';
import {
  INCREMENT_TODOS_INVALID_COUNTER_CASE,
  INCREMENT_TODOS_REPO_ERROR_GETBYID_CASE,
  INCREMENT_TODOS_REPO_ERROR_SAVE_CASE,
  INCREMENT_TODOS_SUCCESS_USER_DOESNT_EXIST_CASE,
  INCREMENT_TODOS_SUCCESS_USER_EXISTS_CASE,
} from './increment-todos.mock';
import { UserEntity } from '@src/lib/bounded-contexts/marketing/marketing/domain/user.entity';
import { TodoCompletionsIncrementedDomainEvent } from '@src/lib/bounded-contexts/marketing/marketing/domain/events/todo-completions-incremented.event';
import { DomainErrors } from '@src/lib/bounded-contexts/marketing/marketing/domain/errors';

describe('Increment completed todos feature test', () => {
  it('Incremented completed todos successfully, user exists', async () => {
    const { id, completedTodos } = INCREMENT_TODOS_SUCCESS_USER_EXISTS_CASE;

    // given
    const mockIncrementTodosWriteRepo =
      new MockIncrementCompletedTodosWriteRepo();
    const ctx = new ContextBuilder().withUserId(id).build();
    const incrementTodosCommand = new IncrementTodosCommand({ id });

    // when
    const incrementTodosHandler = new IncrementTodosCommandHandler(
      mockIncrementTodosWriteRepo.getMockUserWriteRepo(),
    );
    const result = await incrementTodosHandler.execute(incrementTodosCommand);

    //then
    const userProps = new UserPropsBuilder()
      .withId(id)
      .withCompletedTodos(completedTodos + 1)
      .build();

    expect(mockIncrementTodosWriteRepo.mockGetByIdMethod).toHaveBeenCalledWith(
      new Domain.UUIDv4(id),
      ctx,
    );
    expect(mockIncrementTodosWriteRepo.mockSaveMethod).toHaveBeenCalledWith(
      expect.any(UserEntity),
      ctx,
    );

    const todoAggregate =
      mockIncrementTodosWriteRepo.mockSaveMethod.mock.calls[0][0];
    expect(todoAggregate.props).toEqual(userProps);
    expect(todoAggregate.domainEvents[0]).toBeInstanceOf(
      TodoCompletionsIncrementedDomainEvent,
    );
    expect(typeof result.value).toBe('undefined');
  });
  it('Incremented completed todos successfully, user does not exist', async () => {
    const { id } = INCREMENT_TODOS_SUCCESS_USER_DOESNT_EXIST_CASE;

    // given
    const mockIncrementTodosWriteRepo =
      new MockIncrementCompletedTodosWriteRepo();
    const ctx = new ContextBuilder().withUserId(id).build();
    const incrementTodosCommand = new IncrementTodosCommand({ id });

    // when
    const incrementTodosHandler = new IncrementTodosCommandHandler(
      mockIncrementTodosWriteRepo.getMockUserWriteRepo(),
    );
    const result = await incrementTodosHandler.execute(incrementTodosCommand);

    //then
    const userProps = new UserPropsBuilder()
      .withId(id)
      .withCompletedTodos(1)
      .build();

    expect(mockIncrementTodosWriteRepo.mockGetByIdMethod).toHaveBeenCalledWith(
      new Domain.UUIDv4(id),
      ctx,
    );
    expect(mockIncrementTodosWriteRepo.mockSaveMethod).toHaveBeenCalledWith(
      expect.any(UserEntity),
      ctx,
    );

    const todoAggregate =
      mockIncrementTodosWriteRepo.mockSaveMethod.mock.calls[0][0];
    expect(todoAggregate.props).toEqual(userProps);
    expect(todoAggregate.domainEvents[0]).toBeInstanceOf(
      TodoCompletionsIncrementedDomainEvent,
    );
    expect(typeof result.value).toBe('undefined');
  });
  it('Incremented completed todos failed, invalid todos counter', async () => {
    const { id } = INCREMENT_TODOS_INVALID_COUNTER_CASE;

    // given
    const mockIncrementTodosWriteRepo =
      new MockIncrementCompletedTodosWriteRepo();
    const ctx = new ContextBuilder().withUserId(id).build();
    const incrementTodosCommand = new IncrementTodosCommand({ id });

    // when
    const incrementTodosHandler = new IncrementTodosCommandHandler(
      mockIncrementTodosWriteRepo.getMockUserWriteRepo(),
    );
    const result = await incrementTodosHandler.execute(incrementTodosCommand);

    //then
    expect(mockIncrementTodosWriteRepo.mockGetByIdMethod).toHaveBeenCalledWith(
      new Domain.UUIDv4(id),
      ctx,
    );
    expect(result.value).toBeInstanceOf(DomainErrors.InvalidTodosCounterError);
  });
  it('Incremented completed todos failed, getById repo error', async () => {
    const { id } = INCREMENT_TODOS_REPO_ERROR_GETBYID_CASE;

    // given
    const mockIncrementTodosWriteRepo =
      new MockIncrementCompletedTodosWriteRepo();
    const ctx = new ContextBuilder().withUserId(id).build();
    const incrementTodosCommand = new IncrementTodosCommand({ id });

    // when
    const incrementTodosHandler = new IncrementTodosCommandHandler(
      mockIncrementTodosWriteRepo.getMockUserWriteRepo(),
    );
    const result = await incrementTodosHandler.execute(incrementTodosCommand);

    //then
    expect(mockIncrementTodosWriteRepo.mockGetByIdMethod).toHaveBeenCalledWith(
      new Domain.UUIDv4(id),
      ctx,
    );
    expect(result.value).toBeInstanceOf(Application.Repo.Errors.Unexpected);
  });
  it('Incremented completed todos failed, save repo error', async () => {
    const { id } = INCREMENT_TODOS_REPO_ERROR_SAVE_CASE;

    // given
    const mockIncrementTodosWriteRepo =
      new MockIncrementCompletedTodosWriteRepo();
    const ctx = new ContextBuilder().withUserId(id).build();
    const incrementTodosCommand = new IncrementTodosCommand({ id });

    // when
    const incrementTodosHandler = new IncrementTodosCommandHandler(
      mockIncrementTodosWriteRepo.getMockUserWriteRepo(),
    );
    const result = await incrementTodosHandler.execute(incrementTodosCommand);

    //then
    expect(mockIncrementTodosWriteRepo.mockGetByIdMethod).toHaveBeenCalledWith(
      new Domain.UUIDv4(id),
      ctx,
    );
    expect(mockIncrementTodosWriteRepo.mockSaveMethod).toHaveBeenCalledWith(
      expect.any(UserEntity),
      ctx,
    );
    expect(result.value).toBeInstanceOf(Application.Repo.Errors.Unexpected);
  });
});