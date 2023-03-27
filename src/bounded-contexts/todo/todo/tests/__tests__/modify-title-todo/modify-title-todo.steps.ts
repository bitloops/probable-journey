import { ModifyTodoTitleHandler } from '@src/lib/bounded-contexts/todo/todo/application/command-handlers/modify-title-todo.handler';
import { ModifyTodoTitleCommand } from '@src/lib/bounded-contexts/todo/todo/commands/modify-title-todo.command';
import { TodoTitleModifiedDomainEvent } from '@src/lib/bounded-contexts/todo/todo/domain/events/todo-title-modified.event';
import { TodoEntity } from '@src/lib/bounded-contexts/todo/todo/domain/TodoEntity';
import { ContextBuilder } from '../../builders/context.builder';
import { TodoPropsBuilder } from '../../builders/todo-props.builder';
import { ModifyTitleWriteRepo } from './modify-title-write-repo.mock';

describe('Modify title todo feature test', () => {
  it('Todo title modified successfully', async () => {
    const todoTitle = 'modify title';
    const userId = '123';
    const titleId = '1';

    // given
    const mockTodoWriteRepo = new ModifyTitleWriteRepo();
    const ctx = new ContextBuilder().withUserId(userId).build();
    const modifyTodoTitleCommand = new ModifyTodoTitleCommand(
      { title: todoTitle, id: titleId },
      // ctx,
    );

    // when
    const modifyTodoTitleHandler = new ModifyTodoTitleHandler(
      mockTodoWriteRepo.getMockTodoWriteRepo(),
    );
    const result = await modifyTodoTitleHandler.execute(modifyTodoTitleCommand);

    //then
    const todoProps = new TodoPropsBuilder()
      .withTitle(todoTitle)
      .withCompleted(false)
      .withUserId(userId)
      .withId(titleId)
      .build();

    expect(mockTodoWriteRepo.mockUpdateMethod).toHaveBeenCalledWith(
      expect.any(TodoEntity),
      ctx,
    );
    const todoAggregate = mockTodoWriteRepo.mockUpdateMethod.mock.calls[0][0];
    expect(todoAggregate.props).toEqual(todoProps);
    expect(todoAggregate.domainEvents[0]).toBeInstanceOf(
      TodoTitleModifiedDomainEvent,
    );
    expect(typeof result.value).toBe('string');
  });

  //   it('Todo failed to be created, invalid title', async () => {
  //     const todoTitle = 'i';
  //     const userId = '123';

  //     // given
  //     const mockTodoWriteRepo = new MockAddTodoWriteRepo();
  //     const ctx = new ContextBuilder().withUserId(userId).build();
  //     const addTodoCommand = new AddTodoCommand({ title: todoTitle }, ctx);

  //     // when
  //     const addTodoHandler = new AddTodoHandler(
  //       mockTodoWriteRepo.getMockTodoWriteRepo(),
  //     );
  //     const result = await addTodoHandler.execute(addTodoCommand);

  //     //then
  //     expect(mockTodoWriteRepo.mockSaveMethod).not.toHaveBeenCalled();
  //     expect(result.value).toBeInstanceOf(DomainErrors.TitleOutOfBoundsError);
  //   });

  //   it('Todo failed to be created, repo error', async () => {
  //     const todoTitle = 'New todo title';
  //     const userId = FAILED_USER_ID;

  //     // given
  //     const mockTodoWriteRepo = new MockAddTodoWriteRepo();
  //     const ctx = new ContextBuilder().withUserId(userId).build();
  //     const addTodoCommand = new AddTodoCommand({ title: todoTitle }, ctx);

  //     // when
  //     const addTodoHandler = new AddTodoHandler(
  //       mockTodoWriteRepo.getMockTodoWriteRepo(),
  //     );
  //     const result = await addTodoHandler.execute(addTodoCommand);

  //     //then
  //     expect(mockTodoWriteRepo.mockSaveMethod).toHaveBeenCalled();
  //     expect(result.value).toBeInstanceOf(Application.Repo.Errors.Unexpected);
  //   });
});
