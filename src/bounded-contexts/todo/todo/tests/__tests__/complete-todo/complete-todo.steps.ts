import { AddTodoCommandHandler } from '@src/lib/bounded-contexts/todo/todo/application/command-handlers/add-todo.handler';
import { CompleteTodoHandler } from '@src/lib/bounded-contexts/todo/todo/application/command-handlers/complete-todo.handler';
import { AddTodoCommand } from '@src/lib/bounded-contexts/todo/todo/commands/add-todo.command';
import { CompleteTodoCommand } from '@src/lib/bounded-contexts/todo/todo/commands/complete-todo.command';
import { DomainErrors } from '@src/lib/bounded-contexts/todo/todo/domain/errors';
import { TodoAddedDomainEvent } from '@src/lib/bounded-contexts/todo/todo/domain/events/todo-added.event';
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
    // const addTodoCommand = new AddTodoCommand({ title: todoTitle }, ctx);
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
      .build();

    expect(mockCompleteTodoWriteRepo.getMockSaveMethod()).toHaveBeenCalledWith(
      expect.any(TodoEntity),
      ctx,
    );
    const todoAggregate =
      mockCompleteTodoWriteRepo.getMockSaveMethod().mock.calls[0][0];
    expect(todoAggregate.props).toEqual(todoProps);
    expect(todoAggregate.domainEvents[0]).toBeInstanceOf(
      TodoCompletedDomainEvent,
    );
    expect(typeof result.value).toBe('string');
  });

  //   it('Todo failed to be created, invalid title', async () => {
  //     //     const todoTitle = 'i';
  //     //     const userId = '123';
  //     //     // given
  //     //     const mockTodoWriteRepo = new MockTodoWriteRepo();
  //     //     const ctx = new ContextBuilder().withUserId(userId).build();
  //     //     const addTodoCommand = new AddTodoCommand({ title: todoTitle }, ctx);
  //     //     // when
  //     //     const addTodoHandler = new AddTodoHandler(
  //     //       mockTodoWriteRepo.getMockTodoWriteRepo(),
  //     //     );
  //     //     const result = await addTodoHandler.execute(addTodoCommand);
  //     //     //then
  //     //     expect(mockTodoWriteRepo.getMockSaveMethod()).not.toHaveBeenCalled();
  //     //     expect(result.value).toBeInstanceOf(DomainErrors.TitleOutOfBoundsError);
  //   });
});
