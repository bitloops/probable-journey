import { TodoCompletedIntegrationEventHandler } from './integration/todo-completed.integration-handler';
import { TodoCompletionsIncrementedHandler } from './domain/todo-completions-incremented.handler';
import { UserRegisteredIntegrationEventHandler } from './integration/user-registered.integration-handler';
export const EventHandlers = [TodoCompletedIntegrationEventHandler, TodoCompletionsIncrementedHandler, UserRegisteredIntegrationEventHandler];