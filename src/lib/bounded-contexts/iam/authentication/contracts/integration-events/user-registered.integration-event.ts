import { Infra } from '@bitloops/bl-boilerplate-core';
import { UserRegisteredDomainEvent } from '../../domain/events/user-registered.event';

export type IntegrationSchemaV1 = {
  userId: string;
  email: string;
};

type IntegrationSchemas = IntegrationSchemaV1;
type ToIntegrationDataMapper = (
  data: UserRegisteredDomainEvent,
) => IntegrationSchemas;

export class UserRegisteredIntegrationEvent extends Infra.EventBus
  .IntegrationEvent<IntegrationSchemas> {
  static versions = ['v1'];
  public static readonly fromContextId =
    UserRegisteredDomainEvent.fromContextId; // get from it's own context in case we have some props as input
  static versionMappers: Record<string, ToIntegrationDataMapper> = {
    v1: UserRegisteredIntegrationEvent.toIntegrationDataV1,
  };

  constructor(data: IntegrationSchemas, version: string, uuid?: string) {
    const metadata = {
      id: uuid,
      fromContextId: UserRegisteredIntegrationEvent.fromContextId,
      version,
    };
    super(
      UserRegisteredIntegrationEvent.getEventTopic(version),
      data,
      metadata,
    );
  }

  static create(
    event: UserRegisteredDomainEvent,
  ): UserRegisteredIntegrationEvent[] {
    return UserRegisteredIntegrationEvent.versions.map((version) => {
      const mapper = UserRegisteredIntegrationEvent.versionMappers[version];
      const data = mapper(event);
      return new UserRegisteredIntegrationEvent(data, version);
    });
  }

  static toIntegrationDataV1(
    data: UserRegisteredDomainEvent,
  ): IntegrationSchemaV1 {
    return {
      userId: data.user.id.toString(),
      email: data.user.email.email,
    };
  }

  static getEventTopic(version?: string) {
    const topic = `integration.${UserRegisteredIntegrationEvent.name}`;

    const eventTopic = version === undefined ? topic : `${topic}.${version}`;
    return eventTopic;
  }
}
