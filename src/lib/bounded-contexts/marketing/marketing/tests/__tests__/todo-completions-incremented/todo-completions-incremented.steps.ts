import { ContextBuilder } from '../../builders/context.builder';
import { TodoCompletionsIncrementedDomainEvent } from '@src/lib/bounded-contexts/marketing/marketing/domain/events/todo-completions-incremented.event';
import { MockUserEmailReadRepo } from './user-email-read-repo.mock';
import { TodoCompletionsIncrementedHandler } from '../../../application/event-handlers/domain/todo-completions-incremented.handler';
import { MockNotificationTemplateReadRepo } from './notification-template-read-repo.mock';
import { UserEntityBuilder } from '../../builders/user-entity.builder';
import { Domain } from '@src/bitloops/bl-boilerplate-core';
import { SUCCESS_CASE } from './todo-completions-incremented.mock';

describe('Todo completions incremented feature test', () => {
  it('Todo completions incremented successfully', async () => {
    const { userId, completedTodos } = SUCCESS_CASE;

    // given
    const mockNotificationTemplateReadRepo =
      new MockNotificationTemplateReadRepo();
    const mockUserEmailReadRepo = new MockUserEmailReadRepo();
    const ctx = new ContextBuilder().withUserId(userId).build();
    const user = new UserEntityBuilder()
      .withId(userId)
      .withCompletedTodos(completedTodos)
      .build();
    const todoCompletionsDomainEvent =
      new TodoCompletionsIncrementedDomainEvent(user);

    // when
    const todoCompletionsIncrementedEventHandler =
      new TodoCompletionsIncrementedHandler(
        mockUserEmailReadRepo.getMockUserEmailReadRepo(),
        mockNotificationTemplateReadRepo.getMockNotificationTemplateReadRepo(),
      );
    const result = await todoCompletionsIncrementedEventHandler.handle(
      todoCompletionsDomainEvent,
    );

    //then
    expect(mockUserEmailReadRepo.mockGetUserEmailMethod).toHaveBeenCalledWith(
      new Domain.UUIDv4(userId),
      ctx,
    );
    expect(
      mockNotificationTemplateReadRepo.mockGetByTypeMethod,
    ).toHaveBeenCalledWith('firstTodo', ctx);

    // const todoAggregate =
    //   mockCompleteTodoWriteRepo.mockSaveMethod.mock.calls[0][0];
    // expect(todoAggregate.props).toEqual(userProps);
    // expect(todoAggregate.domainEvents[0]).toBeInstanceOf(
    //   TodoCompletionsIncrementedDomainEvent,
    // );
    expect(typeof result.value).toBe('undefined');
  });
});
