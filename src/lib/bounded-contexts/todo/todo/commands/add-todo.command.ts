import { Application } from '@bitloops/bl-boilerplate-core';
import { asyncLocalStorage } from '@src/bitloops/tracing';

export type TAddTodoCommand = {
  title: string;
};

export class AddTodoCommand extends Application.Command {
  public readonly metadata: Application.TCommandMetadata = {
    toContextId: 'Todo',
    createdTimestamp: Date.now(),
    correlationId: asyncLocalStorage.getStore()?.get('correlationId'),
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
