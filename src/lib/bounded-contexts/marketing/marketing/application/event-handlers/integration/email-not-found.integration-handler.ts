import { Infra, Application } from '@src/bitloops/bl-boilerplate-core';

export class EmailNotFoundIntegrationErrorEventHandler
    implements Application.IHandle {
    constructor(private integrationEventBus: Infra.EventBus.IEventBus) { }

    public async handle(
        event: any /*EmailNotFoundIntegrationErrorEvent*/,
    ): Promise<void> {
        const { data } = event;
        console.log('data received from EmailNotFoundIntegrationErrorEventHandler', data);

        console.log(
            `[EmailNotFounIntegrationErrorEvent]: Successfully sent EmailNotFoundCommand`,
        );
    }
}