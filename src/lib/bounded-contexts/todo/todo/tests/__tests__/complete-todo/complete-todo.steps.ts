import { CompleteTodoHandler } from '@src/lib/bounded-contexts/todo/todo/application/command-handlers/complete-todo.handler';
import { CompleteTodoCommand } from '@src/lib/bounded-contexts/todo/todo/commands/complete-todo.command';
import { TodoCompletedDomainEvent } from '@src/lib/bounded-contexts/todo/todo/domain/events/todo-completed.event';
import { TodoEntity } from '@src/lib/bounded-contexts/todo/todo/domain/TodoEntity';
import { ApplicationErrors } from '@src/lib/bounded-contexts/todo/todo/application/errors';
import { ContextBuilder } from '../../builders/context.builder';
import { TodoPropsBuilder } from '../../builders/todo-props.builder';
import { MockCompleteTodoWriteRepo } from './complete-todo-write-repo.mock';
import {
  COMPLETE_TODO_NOT_FOUND_CASE,
  COMPLETE_TODO_REPO_ERROR_GETBYID_CASE,
  COMPLETE_TODO_REPO_ERROR_SAVE_CASE,
  COMPLETE_TODO_SUCCESS_CASE,
} from './complete-todo.mock';
import { Application } from '@src/bitloops/bl-boilerplate-core';

describe('Complete todo feature test', () => {
  it('Todo completed successfully', async () => {
    const todoTitle = COMPLETE_TODO_SUCCESS_CASE.title;
    const userId = COMPLETE_TODO_SUCCESS_CASE.userId;
    const todoId = COMPLETE_TODO_SUCCESS_CASE.id;

    // given
    const mockCompleteTodoWriteRepo = new MockCompleteTodoWriteRepo();
    const ctx = new ContextBuilder().withUserId(userId).build();
    const completeTodoCommand = new CompleteTodoCommand({ todoId }, ctx);

    // when
    const completeTodoHandler = new CompleteTodoHandler(
      mockCompleteTodoWriteRepo.getMockTodoWriteRepo(),
    );
    const result = await completeTodoHandler.execute(completeTodoCommand);

    //then
    const todoProps = new TodoPropsBuilder()
      .withTitle(todoTitle)
      .withCompleted(true)
      .withUserId(userId)
      .withId(todoId)
      .build();

    expect(mockCompleteTodoWriteRepo.mockGetByIdMethod).toHaveBeenCalledWith(
      { value: todoId },
      ctx,
    );
    expect(mockCompleteTodoWriteRepo.mockSaveMethod).toHaveBeenCalledWith(
      expect.any(TodoEntity),
      ctx,
    );

    const todoAggregate =
      mockCompleteTodoWriteRepo.mockSaveMethod.mock.calls[0][0];
    expect(todoAggregate.props).toEqual(todoProps);
    expect(todoAggregate.domainEvents[0]).toBeInstanceOf(
      TodoCompletedDomainEvent,
    );
    expect(typeof result.value).toBe('undefined');
  });

  it('Todo completed failed, todo not found', async () => {
    const userId = COMPLETE_TODO_NOT_FOUND_CASE.userId;
    const todoId = COMPLETE_TODO_NOT_FOUND_CASE.id;

    // given
    const mockCompleteTodoWriteRepo = new MockCompleteTodoWriteRepo();
    const ctx = new ContextBuilder().withUserId(userId).build();
    const completeTodoCommand = new CompleteTodoCommand({ todoId }, ctx);

    // when
    const completeTodoHandler = new CompleteTodoHandler(
      mockCompleteTodoWriteRepo.getMockTodoWriteRepo(),
    );
    const result = await completeTodoHandler.execute(completeTodoCommand);

    //then
    expect(mockCompleteTodoWriteRepo.mockGetByIdMethod).toHaveBeenCalledWith(
      { value: todoId },
      ctx,
    );
    expect(result.value).toBeInstanceOf(ApplicationErrors.TodoNotFoundError);
  });
  it('Todo failed to be completed, repo error to getById', async () => {
    const userId = COMPLETE_TODO_REPO_ERROR_GETBYID_CASE.userId;
    const todoId = COMPLETE_TODO_REPO_ERROR_GETBYID_CASE.id;

    // given
    const mockCompleteTodoWriteRepo = new MockCompleteTodoWriteRepo();
    const ctx = new ContextBuilder().withUserId(userId).build();
    const completeTodoCommand = new CompleteTodoCommand({ todoId }, ctx);

    // when
    const completeTodoHandler = new CompleteTodoHandler(
      mockCompleteTodoWriteRepo.getMockTodoWriteRepo(),
    );
    const result = await completeTodoHandler.execute(completeTodoCommand);

    //then
    expect(mockCompleteTodoWriteRepo.mockGetByIdMethod).toHaveBeenCalledWith(
      { value: todoId },
      ctx,
    );
    expect(result.value).toBeInstanceOf(Application.Repo.Errors.Unexpected);
  });
  it('Todo failed to be completed, repo error to save', async () => {
    const userId = COMPLETE_TODO_REPO_ERROR_SAVE_CASE.userId;
    const todoId = COMPLETE_TODO_REPO_ERROR_SAVE_CASE.id;

    // given
    const mockCompleteTodoWriteRepo = new MockCompleteTodoWriteRepo();
    const ctx = new ContextBuilder().withUserId(userId).build();
    const completeTodoCommand = new CompleteTodoCommand({ todoId }, ctx);

    // when
    const completeTodoHandler = new CompleteTodoHandler(
      mockCompleteTodoWriteRepo.getMockTodoWriteRepo(),
    );
    const result = await completeTodoHandler.execute(completeTodoCommand);

    //then
    expect(mockCompleteTodoWriteRepo.mockGetByIdMethod).toHaveBeenCalledWith(
      { value: todoId },
      ctx,
    );
    expect(mockCompleteTodoWriteRepo.mockSaveMethod).toHaveBeenCalledWith(
      expect.any(TodoEntity),
      ctx,
    );
    expect(result.value).toBeInstanceOf(Application.Repo.Errors.Unexpected);
  });
});
