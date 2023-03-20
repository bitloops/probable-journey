import { LogInHandler } from './log-in.handler';
import { RegisterHandler } from './register.handler';
import { UpdateEmailHandler } from './update-email.handler';

export const PubSubCommandHandlers = [
  LogInHandler,
  RegisterHandler,
  UpdateEmailHandler,
];
