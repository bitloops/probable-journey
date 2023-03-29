import { Application } from '@src/bitloops/bl-boilerplate-core';
import { GetTodosHandler } from '../../../application/query-handlers/get-todos.handler';
import { GetTodosQuery } from '../../../queries/get-todos.query';
import { ContextBuilder } from '../../builders/context.builder';
import { TodoReadModelBuilder } from '../../builders/todo-read-model.builder';
import { MockGetTodosReadRepo } from './get-todos-read-repo.mock';
import {
  GET_TODOS_EMPTY_ARRAY_CASE,
  GET_TODOS_REPO_ERROR_CASE,
  GET_TODOS_SUCCESS_CASE,
} from './get-todos.mock';

describe('Get todos feature test', () => {
  it('Get all todos successfully', async () => {
    const { userId, title, titleId, completed } = GET_TODOS_SUCCESS_CASE;

    // given
    const mockTodoReadRepo = new MockGetTodosReadRepo();
    const ctx = new ContextBuilder().withUserId(userId).build();
    const getTodosQuery = new GetTodosQuery();

    // when
    const getTodosHandler = new GetTodosHandler(
      mockTodoReadRepo.getMockTodoReadRepo(),
    );
    const result = await getTodosHandler.execute(getTodosQuery);

    //then
    const todoReadModel = new TodoReadModelBuilder()
      .withId(titleId)
      .withCompleted(completed)
      .withTitle(title)
      .withUserId(userId)
      .build();

    expect(mockTodoReadRepo.mockGetAllMethod).toHaveBeenCalledWith(ctx);
    expect(result.value).toEqual([todoReadModel]);
  });

  it('Get all todos successfully, empty array', async () => {
    const { userId } = GET_TODOS_EMPTY_ARRAY_CASE;

    // given
    const mockTodoReadRepo = new MockGetTodosReadRepo();
    const ctx = new ContextBuilder().withUserId(userId).build();
    const getTodosQuery = new GetTodosQuery();

    // when
    const getTodosHandler = new GetTodosHandler(
      mockTodoReadRepo.getMockTodoReadRepo(),
    );
    const result = await getTodosHandler.execute(getTodosQuery);

    //then
    expect(mockTodoReadRepo.mockGetAllMethod).toHaveBeenCalledWith(ctx);
    expect(result.value).toEqual([]);
  });

  it('Failed to get all todos, repo error', async () => {
    const { userId } = GET_TODOS_REPO_ERROR_CASE;

    // given
    const mockTodoReadRepo = new MockGetTodosReadRepo();
    const ctx = new ContextBuilder().withUserId(userId).build();
    const getTodosQuery = new GetTodosQuery();

    // when
    const getTodosHandler = new GetTodosHandler(
      mockTodoReadRepo.getMockTodoReadRepo(),
    );
    const result = await getTodosHandler.execute(getTodosQuery);

    //then
    expect(mockTodoReadRepo.mockGetAllMethod).toHaveBeenCalledWith(ctx);
    expect(result.value).toBeInstanceOf(Application.Repo.Errors.Unexpected);
  });
});
