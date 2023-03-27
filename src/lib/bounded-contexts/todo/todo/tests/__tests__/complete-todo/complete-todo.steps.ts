import { Domain } from '@src/bitloops/bl-boilerplate-core';
import { CompleteTodoHandler } from '@src/lib/bounded-contexts/todo/todo/application/command-handlers/complete-todo.handler';
import { CompleteTodoCommand } from '@src/lib/bounded-contexts/todo/todo/commands/complete-todo.command';
import { TodoCompletedDomainEvent } from '@src/lib/bounded-contexts/todo/todo/domain/events/todo-completed.event';
import { TodoEntity } from '@src/lib/bounded-contexts/todo/todo/domain/TodoEntity';
import { ContextBuilder } from '../../builders/context.builder';
import { TodoPropsBuilder } from '../../builders/todo-props.builder';
import { MockCompleteTodoWriteRepo } from './complete-todo-write-repo.mock';
// import { ContextBuilder } from './builders/context.builder';
// import { TodoPropsBuilder } from './builders/todo-props.builder';
// import { MockTodoWriteRepo } from './mocks/todo-write-repo.mock';

describe('Complete todo feature test', () => {
  it('Todo completed successfully', async () => {
    const todoTitle = 'New todo title';
    const userId = '123';
    const todoId = 'todo1';

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
});
