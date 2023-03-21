import { UserRegisteredPublishIntegrationEventHandler } from './user-registered-publish.event-handler';
import { UserUpdatedEmailPublishIntegrationEventHandler } from './updated-email-publish.event-handler';

export const StreamingDomainEventHandlers = [
  UserRegisteredPublishIntegrationEventHandler,
  UserUpdatedEmailPublishIntegrationEventHandler,
];

export const EventHandlers = [...StreamingDomainEventHandlers];
