import { Application } from '@bitloops/bl-boilerplate-core';

export type TCompleteTodoCommand = {
  todoId: string;
};

export class CompleteTodoCommand extends Application.Command {
  public readonly metadata: Application.TCommandMetadata = {
    toContextId: 'Todo',
    createdTimestamp: Date.now(),
  };
  public id: string;

  constructor(
    props: TCompleteTodoCommand,
    public readonly ctx: Application.TContext,
  ) {
    super();
    this.id = props.todoId;
  }
}
