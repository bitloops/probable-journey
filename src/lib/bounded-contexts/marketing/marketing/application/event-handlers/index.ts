import { TodoCompletedIntegrationEventHandler } from './integration/todo-completed.integration-handler';
import { TodoCompletionsIncrementedHandler } from './domain/todo-completions-incremented.handler';
export const EventHandlers = [TodoCompletedIntegrationEventHandler, TodoCompletionsIncrementedHandler];