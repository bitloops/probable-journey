import { TodoAddedDomainToPubSubIntegrationEventHandler } from './domain/todo-added-publish-pubsub.handler';
import { TodoAddedDomainToIntegrationEventHandler } from './domain/todo-added.handler';
import { TodoCompletedDomainToIntegrationEventHandler } from './domain/todo-completed.handler';

export const StreamingDomainEventHandlers = [
  TodoAddedDomainToIntegrationEventHandler,
  TodoCompletedDomainToIntegrationEventHandler,
  TodoAddedDomainToPubSubIntegrationEventHandler,
];

export const StreamingIntegrationEventHandlers = [];

export const StreamingErrorEventHandlers = [];
export const EventHandlers = [...StreamingDomainEventHandlers];
