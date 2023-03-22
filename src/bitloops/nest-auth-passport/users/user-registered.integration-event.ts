import { Infra } from '@src/bitloops/bl-boilerplate-core';

type UserRegisteredIntegrationSchemaV1 = {
  userId: string;
  email: string;
};

export class UserRegisteredIntegrationEvent
  implements Infra.EventBus.IntegrationEvent<UserRegisteredIntegrationSchemaV1>
{
  public metadata: any;
  constructor(public data: UserRegisteredIntegrationSchemaV1) {
    this.metadata = {
      fromContextId: 'IAM',
      version: 'v1',
    };
  }
}
