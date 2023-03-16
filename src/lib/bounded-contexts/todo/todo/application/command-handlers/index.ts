import { AddTodoHandler } from './add-todo.handler';
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
  AddTodoHandler,
  // CompleteTodoHandler,
  // UncompleteTodoHandler,
  // ModifyTodoTitleHandler,
];

export const StreamingCommandHandlers = [AddTodoHandler, CompleteTodoHandler];
