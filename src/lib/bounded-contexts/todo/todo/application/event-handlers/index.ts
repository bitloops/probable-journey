import { TodoAddedDomainToIntegrationEventHandler } from './domain/todo-added.handler';
import { TodoCompletedDomainToIntegrationEventHandler } from './domain/todo-completed.handler';

export const StreamingDomainEventHandlers = [
  TodoAddedDomainToIntegrationEventHandler,
  TodoCompletedDomainToIntegrationEventHandler,
];

export const StreamingIntegrationEventHandlers = [];

export const StreamingErrorEventHandlers = [];
export const EventHandlers = [...StreamingDomainEventHandlers];
