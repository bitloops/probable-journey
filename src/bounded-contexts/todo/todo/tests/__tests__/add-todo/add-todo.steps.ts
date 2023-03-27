import { Application } from '@src/bitloops/bl-boilerplate-core';
import { AddTodoCommandHandler } from '@src/lib/bounded-contexts/todo/todo/application/command-handlers/add-todo.handler';
import { AddTodoCommand } from '@src/lib/bounded-contexts/todo/todo/commands/add-todo.command';
import { DomainErrors } from '@src/lib/bounded-contexts/todo/todo/domain/errors';
import { TodoAddedDomainEvent } from '@src/lib/bounded-contexts/todo/todo/domain/events/todo-added.event';
import { TodoEntity } from '@src/lib/bounded-contexts/todo/todo/domain/TodoEntity';
import { ContextBuilder } from '../../builders/context.builder';
import { TodoPropsBuilder } from '../../builders/todo-props.builder';
import { MockAddTodoWriteRepo } from './add-todo-write-repo.mock';
import { FAILED_USER_ID } from './add-todo.mock';

describe('Add todo feature test', () => {
  it('Todo created successfully', async () => {
    const todoTitle = 'New todo title';
    const userId = '123';

    // given
    const mockTodoWriteRepo = new MockAddTodoWriteRepo();
    const ctx = new ContextBuilder().withUserId(userId).build();
    const addTodoCommand = new AddTodoCommand({ title: todoTitle }, ctx);

    // when
    const addTodoHandler = new AddTodoCommandHandler(
      mockTodoWriteRepo.getMockTodoWriteRepo(),
    );
    const result = await addTodoHandler.execute(addTodoCommand);

    //then
    const todoProps = new TodoPropsBuilder()
      .withTitle(todoTitle)
      .withCompleted(false)
      .withUserId(userId)
      .build();

    expect(mockTodoWriteRepo.mockSaveMethod).toHaveBeenCalledWith(
      expect.any(TodoEntity),
      ctx,
    );
    const todoAggregate = mockTodoWriteRepo.mockSaveMethod.mock.calls[0][0];
    expect(todoAggregate.props).toEqual(todoProps);
    expect(todoAggregate.domainEvents[0]).toBeInstanceOf(TodoAddedDomainEvent);
    expect(typeof result.value).toBe('string');
  });

  it('Todo failed to be created, invalid title', async () => {
    const todoTitle = 'i';
    const userId = '123';

    // given
    const mockTodoWriteRepo = new MockAddTodoWriteRepo();
    const ctx = new ContextBuilder().withUserId(userId).build();
    const addTodoCommand = new AddTodoCommand({ title: todoTitle }, ctx);

    // when
    const addTodoHandler = new AddTodoCommandHandler(
      mockTodoWriteRepo.getMockTodoWriteRepo(),
    );
    const result = await addTodoHandler.execute(addTodoCommand);

    //then
    expect(mockTodoWriteRepo.mockSaveMethod).not.toHaveBeenCalled();
    expect(result.value).toBeInstanceOf(DomainErrors.TitleOutOfBoundsError);
  });

  it.skip('Todo failed to be created, repo error', async () => {
    const todoTitle = 'New todo title';
    const userId = FAILED_USER_ID;

    // given
    const mockTodoWriteRepo = new MockAddTodoWriteRepo();
    const ctx = new ContextBuilder().withUserId(userId).build();
    const addTodoCommand = new AddTodoCommand({ title: todoTitle }, ctx);

    // when
    const addTodoHandler = new AddTodoCommandHandler(
      mockTodoWriteRepo.getMockTodoWriteRepo(),
    );
    const result = await addTodoHandler.execute(addTodoCommand);

    //then
    expect(mockTodoWriteRepo.mockSaveMethod).toHaveBeenCalled();
    expect(result.value).toBeInstanceOf(Application.Repo.Errors.Unexpected);
  });
});
