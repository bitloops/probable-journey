export const INCREMENT_TODOS_SUCCESS_USER_EXISTS_CASE = {
  userId: '123',
  id: 'todo1',
  completedTodos: 0,
};

export const INCREMENT_TODOS_SUCCESS_USER_DOESNT_EXIST_CASE = {
  userId: '1234',
};

export const INCREMENT_TODOS_INVALID_COUNTER_CASE = {
  userId: '12345',
  id: 'todo2',
  completedTodos: -10,
};
