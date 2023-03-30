import { AddTodoCommandHandler } from './add-todo.handler';
import { CompleteTodoHandler } from './complete-todo.handler';
import { UncompleteTodoHandler } from './uncomplete-todo.handler';
import { ModifyTodoTitleHandler } from './modify-title-todo.handler';
// export const CommandHandlers = [
//   AddTodoHandler,
//   CompleteTodoHandler,
//   UncompleteTodoHandler,
//   ModifyTodoTitleHandler,
// ];

export const PubSubCommandHandlers = [
  AddTodoCommandHandler,
  CompleteTodoHandler,
  // UncompleteTodoHandler,
  // ModifyTodoTitleHandler,
];

export const StreamingCommandHandlers = [
  AddTodoCommandHandler,
  CompleteTodoHandler,
];
