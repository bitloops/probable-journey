import { Infra, Application } from '@bitloops/bl-boilerplate-core';
import { UserUpdatedEmailIntegrationEvent } from '../../contracts/integration-events/user-updated-email.integration-event';
import { UserUpdatedEmailDomainEvent } from '../../domain/events/user-updated-email.event';


export class UserUpdatedEmailPublishIntegrationEventHandler implements Application.IHandle {
    private eventBus: Infra.EventBus.IEventBus;
    constructor() {
    }

    public async handle(event: UserUpdatedEmailDomainEvent): Promise<void> {
        const events = UserUpdatedEmailIntegrationEvent.create(
            event
        );
        await this.eventBus.publishMany(events);

        console.log(
            `[UserUpdatedEmailPublishIntegrationEventHandler]: Successfully published UserUpdatedEmailIntegrationEvent`,
        );
    }
}
