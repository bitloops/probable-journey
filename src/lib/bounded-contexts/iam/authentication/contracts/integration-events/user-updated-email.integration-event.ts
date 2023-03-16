import { Infra } from '@bitloops/bl-boilerplate-core';
import { UserUpdatedEmailDomainEvent } from '../../domain/events/user-updated-email.event';

export type IntegrationSchemaV1 = {
    userId: string;
    email: string;
};

type IntegrationSchemas = IntegrationSchemaV1;
type ToIntegrationDataMapper = (
    data: UserUpdatedEmailDomainEvent,
) => IntegrationSchemas;

export class UserUpdatedEmailIntegrationEvent extends Infra.EventBus
    .IntegrationEvent<IntegrationSchemas> {
    static versions = ['v1'];
    public static readonly fromContextId =
        UserUpdatedEmailDomainEvent.fromContextId; // get from it's own context in case we have some props as input
    static versionMappers: Record<string, ToIntegrationDataMapper> = {
        v1: UserUpdatedEmailIntegrationEvent.toIntegrationDataV1,
    };

    constructor(data: IntegrationSchemas, version: string, uuid?: string) {
        const metadata = {
            id: uuid,
            fromContextId: UserUpdatedEmailIntegrationEvent.fromContextId,
            version,
        };
        super(
            UserUpdatedEmailIntegrationEvent.getEventTopic(version),
            data,
            metadata,
        );
    }

    static create(
        event: UserUpdatedEmailDomainEvent,
    ): UserUpdatedEmailIntegrationEvent[] {
        return UserUpdatedEmailIntegrationEvent.versions.map((version) => {
            const mapper = UserUpdatedEmailIntegrationEvent.versionMappers[version];
            const data = mapper(event);
            return new UserUpdatedEmailIntegrationEvent(data, version);
        });
    }

    static toIntegrationDataV1(
        data: UserUpdatedEmailDomainEvent,
    ): IntegrationSchemaV1 {
        return {
            userId: data.user.id.toString(),
            email: data.user.email.email,
        };
    }

    static getEventTopic(version?: string) {
        const topic = `integration.${UserUpdatedEmailIntegrationEvent.name}`;

        const eventTopic = version === undefined ? topic : `${topic}.${version}`;
        return eventTopic;
    }
}
