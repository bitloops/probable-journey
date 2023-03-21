import { Application } from '@bitloops/bl-boilerplate-core';

export type TAddTodoCommand = {
  title: string;
};

export class AddTodoCommand extends Application.Command {
  public readonly metadata: Application.TCommandMetadata = {
    toContextId: 'Todo',
    createdTimestamp: Date.now(),
  };
  public title: string;

  constructor(
    props: TAddTodoCommand,
    public readonly ctx: Application.TContext,
  ) {
    super();
    this.title = props.title;
  }
}
