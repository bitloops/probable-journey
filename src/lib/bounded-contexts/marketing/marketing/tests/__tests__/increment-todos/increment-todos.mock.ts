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

export const INCREMENT_TODOS_REPO_ERROR_GETBYID_CASE = {
  userId: '123456',
  id: 'todo3',
  completedTodos: 1,
};

export const INCREMENT_TODOS_REPO_ERROR_SAVE_CASE = {
  userId: '1234567',
  id: 'todo4',
  completedTodos: 1,
};
