import { Application, Domain } from '@src/bitloops/bl-boilerplate-core';
import { ModifyTodoTitleHandler } from '@src/lib/bounded-contexts/todo/todo/application/command-handlers/modify-title-todo.handler';
import { ApplicationErrors } from '@src/lib/bounded-contexts/todo/todo/application/errors';
import { ModifyTodoTitleCommand } from '@src/lib/bounded-contexts/todo/todo/commands/modify-title-todo.command';
import { DomainErrors } from '@src/lib/bounded-contexts/todo/todo/domain/errors';
import { TodoTitleModifiedDomainEvent } from '@src/lib/bounded-contexts/todo/todo/domain/events/todo-title-modified.event';
import { TodoEntity } from '@src/lib/bounded-contexts/todo/todo/domain/TodoEntity';
import { ContextBuilder } from '../../builders/context.builder';
import { TodoPropsBuilder } from '../../builders/todo-props.builder';
import {
  MODIFY_INVALID_TITLE_CASE,
  MODIFY_TITLE_SUCCESS_CASE,
  MODIFY_TODO_GET_BY_ID_REPO_ERROR_CASE,
  MODIFY_TODO_NOT_FOUND_CASE,
  MODIFY_TODO_UPDATE_REPO_ERROR_CASE,
} from './modify-title-todo.mock';
import { ModifyTitleWriteRepo } from './modify-title-write-repo.mock';

describe('Modify title todo feature test', () => {
  it('Todo title modified successfully', async () => {
    const { userId, titleId, titleAfterUpdate, completed } =
      MODIFY_TITLE_SUCCESS_CASE;

    // given
    const mockTodoWriteRepo = new ModifyTitleWriteRepo();
    const ctx = new ContextBuilder().withUserId(userId).build();
    const modifyTodoTitleCommand = new ModifyTodoTitleCommand(
      { title: titleAfterUpdate, id: titleId },
      ctx,
    );

    // when
    const modifyTodoTitleHandler = new ModifyTodoTitleHandler(
      mockTodoWriteRepo.getMockTodoWriteRepo(),
    );
    const result = await modifyTodoTitleHandler.execute(modifyTodoTitleCommand);

    //then
    const todoProps = new TodoPropsBuilder()
      .withTitle(titleAfterUpdate)
      .withCompleted(completed)
      .withUserId(userId)
      .withId(titleId)
      .build();

    expect(mockTodoWriteRepo.mockGetByIdMethod).toHaveBeenCalledWith(
      new Domain.UUIDv4(titleId),
      ctx,
    );
    expect(mockTodoWriteRepo.mockUpdateMethod).toHaveBeenCalledWith(
      expect.any(TodoEntity),
      ctx,
    );
    const todoAggregate = mockTodoWriteRepo.mockUpdateMethod.mock.calls[0][0];
    expect(todoAggregate.props).toEqual(todoProps);
    expect(todoAggregate.domainEvents[0]).toBeInstanceOf(
      TodoTitleModifiedDomainEvent,
    );
    expect(result.value).toBe(undefined);
  });

  it('Todo title failed to be modified, invalid title', async () => {
    const { userId, titleId, titleAfterUpdate } = MODIFY_INVALID_TITLE_CASE;

    // given
    const mockTodoWriteRepo = new ModifyTitleWriteRepo();
    const ctx = new ContextBuilder().withUserId(userId).build();
    const modifyTodoTitleCommand = new ModifyTodoTitleCommand(
      { title: titleAfterUpdate, id: titleId },
      ctx,
    );

    // when
    const modifyTodoTitleHandler = new ModifyTodoTitleHandler(
      mockTodoWriteRepo.getMockTodoWriteRepo(),
    );
    const result = await modifyTodoTitleHandler.execute(modifyTodoTitleCommand);

    //then
    expect(mockTodoWriteRepo.mockGetByIdMethod).toHaveBeenCalledWith(
      new Domain.UUIDv4(titleId),
      ctx,
    );
    expect(mockTodoWriteRepo.mockUpdateMethod).not.toHaveBeenCalled();
    expect(result.value).toBeInstanceOf(DomainErrors.TitleOutOfBoundsError);
  });

  it('Todo title failed to be modified, title not found', async () => {
    const { userId, titleId, titleAfterUpdate } = MODIFY_TODO_NOT_FOUND_CASE;

    // given
    const mockTodoWriteRepo = new ModifyTitleWriteRepo();
    const ctx = new ContextBuilder().withUserId(userId).build();
    const modifyTodoTitleCommand = new ModifyTodoTitleCommand(
      { title: titleAfterUpdate, id: titleId },
      ctx,
    );

    // when
    const modifyTodoTitleHandler = new ModifyTodoTitleHandler(
      mockTodoWriteRepo.getMockTodoWriteRepo(),
    );
    const result = await modifyTodoTitleHandler.execute(modifyTodoTitleCommand);

    //then
    expect(mockTodoWriteRepo.mockGetByIdMethod).toHaveBeenCalledWith(
      new Domain.UUIDv4(titleId),
      ctx,
    );
    expect(mockTodoWriteRepo.mockUpdateMethod).not.toHaveBeenCalled();
    expect(result.value).toBeInstanceOf(ApplicationErrors.TodoNotFoundError);
  });

  it('Todo title failed to be modified, getById repo error', async () => {
    const { userId, titleId, titleAfterUpdate } =
      MODIFY_TODO_GET_BY_ID_REPO_ERROR_CASE;

    // given
    const mockTodoWriteRepo = new ModifyTitleWriteRepo();
    const ctx = new ContextBuilder().withUserId(userId).build();
    const modifyTodoTitleCommand = new ModifyTodoTitleCommand(
      { title: titleAfterUpdate, id: titleId },
      ctx,
    );

    // when
    const modifyTodoTitleHandler = new ModifyTodoTitleHandler(
      mockTodoWriteRepo.getMockTodoWriteRepo(),
    );
    const result = await modifyTodoTitleHandler.execute(modifyTodoTitleCommand);

    //then
    expect(mockTodoWriteRepo.mockGetByIdMethod).toHaveBeenCalledWith(
      new Domain.UUIDv4(titleId),
      ctx,
    );
    expect(mockTodoWriteRepo.mockUpdateMethod).not.toHaveBeenCalled();
    expect(result.value).toBeInstanceOf(Application.Repo.Errors.Unexpected);
  });

  it('Todo title failed to be modified, update repo error', async () => {
    const { userId, titleId, titleAfterUpdate } =
      MODIFY_TODO_UPDATE_REPO_ERROR_CASE;

    // given
    const mockTodoWriteRepo = new ModifyTitleWriteRepo();
    const ctx = new ContextBuilder().withUserId(userId).build();
    const modifyTodoTitleCommand = new ModifyTodoTitleCommand(
      { title: titleAfterUpdate, id: titleId },
      ctx,
    );

    // when
    const modifyTodoTitleHandler = new ModifyTodoTitleHandler(
      mockTodoWriteRepo.getMockTodoWriteRepo(),
    );
    const result = await modifyTodoTitleHandler.execute(modifyTodoTitleCommand);

    //then
    expect(mockTodoWriteRepo.mockGetByIdMethod).toHaveBeenCalledWith(
      new Domain.UUIDv4(titleId),
      ctx,
    );
    expect(mockTodoWriteRepo.mockUpdateMethod).toHaveBeenCalledWith(
      expect.any(TodoEntity),
      ctx,
    );
    expect(result.value).toBeInstanceOf(Application.Repo.Errors.Unexpected);
  });
});