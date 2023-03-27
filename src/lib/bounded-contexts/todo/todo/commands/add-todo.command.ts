import { Application } from '@bitloops/bl-boilerplate-core';
// import { asyncLocalStorage } from '@src/bitloops/tracing';
import { AddCorrelationId } from '@bitloops/tracing';

export type TAddTodoCommand = {
  title: string;
};

@AddCorrelationId
export class AddTodoCommand extends Application.Command {
  public readonly metadata: Application.TCommandMetadata = {
    toContextId: 'Todo',
    createdTimestamp: Date.now(),
    // Async localStorage should perhaps be injected or directly used from our library.
    // correlationId: asyncLocalStorage.getStore()?.get('correlationId'),
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
