import { Application } from '@bitloops/bl-boilerplate-core';

export type TIncrementTodosCommand = {
  userId: string;
};

export class IncrementTodosCommand extends Application.Command {
  public readonly metadata: Application.TCommandMetadata = {
    toContextId: 'Marketing',
    createdTimestamp: Date.now(),
  };
  public userId: string;

  constructor(
    props: TIncrementTodosCommand,
    public readonly ctx?: Application.TContext,
  ) {
    super();
    this.userId = props.userId;
  }
}
