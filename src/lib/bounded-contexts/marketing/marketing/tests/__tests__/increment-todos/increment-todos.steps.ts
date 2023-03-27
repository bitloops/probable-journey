import { Application } from '@src/bitloops/bl-boilerplate-core';
import { IncrementTodosCommand } from '@src/lib/bounded-contexts/marketing/marketing/commands/Increment-todos.command';
import { IncrementTodosCommandHandler } from '@src/lib/bounded-contexts/marketing/marketing/application/command-handlers/increment-todos.command-handler';
import { ContextBuilder } from '../../builders/context.builder';
import { UserPropsBuilder } from '../../builders/user-props.builder';
import { MockIncrementCompletedTodosWriteRepo } from './increment-todos-write-repo.mock';
import {
  INCREMENT_TODOS_INVALID_COUNTER_CASE,
  INCREMENT_TODOS_SUCCESS_USER_DOESNT_EXIST_CASE,
  INCREMENT_TODOS_SUCCESS_USER_EXISTS_CASE,
} from './increment-todos.mock';
import { UserEntity } from '@src/lib/bounded-contexts/marketing/marketing/domain/user.entity';
import { TodoCompletionsIncrementedDomainEvent } from '@src/lib/bounded-contexts/marketing/marketing/domain/events/todo-completions-incremented.event';
import { DomainErrors } from '@src/lib/bounded-contexts/marketing/marketing/domain/errors';

describe('Increment completed todos feature test', () => {
  it('Incremented completed todos successfully, user exists', async () => {
    const { userId, id, completedTodos } =
      INCREMENT_TODOS_SUCCESS_USER_EXISTS_CASE;

    // given
    const mockCompleteTodoWriteRepo =
      new MockIncrementCompletedTodosWriteRepo();
    const ctx = new ContextBuilder().withUserId(userId).build();
    const completeTodoCommand = new IncrementTodosCommand({ userId }, ctx);

    // when
    const completeTodoHandler = new IncrementTodosCommandHandler(
      mockCompleteTodoWriteRepo.getMockTodoWriteRepo(),
    );
    const result = await completeTodoHandler.execute(completeTodoCommand);

    //then
    const userProps = new UserPropsBuilder()
      .withUserId(userId)
      .withId(id)
      .withCompletedTodos(completedTodos + 1)
      .build();

    expect(mockCompleteTodoWriteRepo.mockGetByIdMethod).toHaveBeenCalledWith(
      { value: userId },
      ctx,
    );
    expect(mockCompleteTodoWriteRepo.mockSaveMethod).toHaveBeenCalledWith(
      expect.any(UserEntity),
      ctx,
    );

    const todoAggregate =
      mockCompleteTodoWriteRepo.mockSaveMethod.mock.calls[0][0];
    expect(todoAggregate.props).toEqual(userProps);
    expect(todoAggregate.domainEvents[0]).toBeInstanceOf(
      TodoCompletionsIncrementedDomainEvent,
    );
    expect(typeof result.value).toBe('undefined');
  });
  it('Incremented completed todos successfully, user does not exist', async () => {
    const { userId } = INCREMENT_TODOS_SUCCESS_USER_DOESNT_EXIST_CASE;

    // given
    const mockCompleteTodoWriteRepo =
      new MockIncrementCompletedTodosWriteRepo();
    const ctx = new ContextBuilder().withUserId(userId).build();
    const completeTodoCommand = new IncrementTodosCommand({ userId }, ctx);

    // when
    const completeTodoHandler = new IncrementTodosCommandHandler(
      mockCompleteTodoWriteRepo.getMockTodoWriteRepo(),
    );
    const result = await completeTodoHandler.execute(completeTodoCommand);

    //then
    const userProps = new UserPropsBuilder()
      .withUserId(userId)
      .withCompletedTodos(1)
      .build();

    expect(mockCompleteTodoWriteRepo.mockGetByIdMethod).toHaveBeenCalledWith(
      { value: userId },
      ctx,
    );
    expect(mockCompleteTodoWriteRepo.mockSaveMethod).toHaveBeenCalledWith(
      expect.any(UserEntity),
      ctx,
    );

    const todoAggregate =
      mockCompleteTodoWriteRepo.mockSaveMethod.mock.calls[0][0];
    expect(todoAggregate.props).toEqual(userProps);
    expect(todoAggregate.domainEvents[0]).toBeInstanceOf(
      TodoCompletionsIncrementedDomainEvent,
    );
    expect(typeof result.value).toBe('undefined');
  });
  it('Incremented completed todos failed, invalid todos counter', async () => {
    const { userId } = INCREMENT_TODOS_INVALID_COUNTER_CASE;

    // given
    const mockCompleteTodoWriteRepo =
      new MockIncrementCompletedTodosWriteRepo();
    const ctx = new ContextBuilder().withUserId(userId).build();
    const completeTodoCommand = new IncrementTodosCommand({ userId }, ctx);

    // when
    const completeTodoHandler = new IncrementTodosCommandHandler(
      mockCompleteTodoWriteRepo.getMockTodoWriteRepo(),
    );
    const result = await completeTodoHandler.execute(completeTodoCommand);

    //then

    expect(mockCompleteTodoWriteRepo.mockGetByIdMethod).toHaveBeenCalledWith(
      { value: userId },
      ctx,
    );
    expect(result.value).toBeInstanceOf(DomainErrors.InvalidTodosCounterError);
  });
});
