import { Application } from '@bitloops/bl-boilerplate-core';

export type TUncompleteTodoCommand = {
  id: string;
};

export class UncompleteTodoCommand extends Application.Command {
  public readonly metadata: Application.TCommandMetadata = {
    toContextId: 'Todo',
    createdTimestamp: Date.now(),
  };
  public id: string;

  constructor(
    props: TUncompleteTodoCommand,
    public readonly ctx: Application.TContext,
  ) {
    super();
    this.id = props.id;
  }
}
