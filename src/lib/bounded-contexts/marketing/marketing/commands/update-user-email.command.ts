import { Application, Domain } from '@bitloops/bl-boilerplate-core';
import { asyncLocalStorage } from '@src/bitloops/tracing';
export type TUpdateUserEmailCommand = {
  email: string;
  userId: string;
};

export class UpdateUserEmailCommand extends Application.Command {
  public readonly metadata: Application.TCommandMetadata = {
    boundedContextId: 'Marketing',
    createdTimestamp: Date.now(),
    messageId: new Domain.UUIDv4().toString(),
    correlationId: asyncLocalStorage.getStore()?.get('correlationId'),
    context: asyncLocalStorage.getStore()?.get('context'),
  };
  public email: string;
  public userId: string;

  constructor(
    props: TUpdateUserEmailCommand,
    public readonly ctx: Application.TContext,
  ) {
    super();
    this.email = props.email;
    this.userId = props.userId;
  }
}
