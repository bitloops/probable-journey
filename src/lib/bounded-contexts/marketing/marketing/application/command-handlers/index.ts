import { IncrementTodosCommandHandler } from './increment-todos.command-handler';
import { SendEmailCommandHandler } from './send-email.command-handler';

export const StreamingCommandHandlers = [
  IncrementTodosCommandHandler,
  SendEmailCommandHandler,
];
