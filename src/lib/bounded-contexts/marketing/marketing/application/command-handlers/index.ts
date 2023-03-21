import { CreateUserCommandHandler } from './create-user.command-handler';
import { IncrementTodosCommandHandler } from './increment-todos.command-handler';
import { SendEmailCommandHandler } from './send-email.command-handler';
import { UpdateUserEmailCommandHandler } from './update-user-email.command-handler';

export const StreamingCommandHandlers = [
  IncrementTodosCommandHandler,
  SendEmailCommandHandler,
  UpdateUserEmailCommandHandler,
  CreateUserCommandHandler,
];
