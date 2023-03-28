import { Application } from '@bitloops/bl-boilerplate-core';

export type TIncrementTodosCommand = {
  id: string;
};

export class IncrementTodosCommand extends Application.Command {
  public readonly metadata: Application.TCommandMetadata = {
    toContextId: 'Marketing',
    createdTimestamp: Date.now(),
  };
  public id: string;

  constructor(
    props: TIncrementTodosCommand,
    public readonly ctx?: Application.TContext,
  ) {
    super();
    this.id = props.id;
  }
}
