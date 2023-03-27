import { Application } from '@bitloops/bl-boilerplate-core';
import { asyncLocalStorage } from '@src/bitloops/tracing';
export type TModifyTodoTitleCommand = {
  id: string;
  title: string;
};
export class ModifyTodoTitleCommand extends Application.Command {
  public readonly id: string;
  public readonly title: string;
  public readonly metadata: Application.TCommandMetadata = {
    toContextId: 'Todo',
    createdTimestamp: Date.now(),
    // Async localStorage should perhaps be injected or directly used from our library.
    correlationId: asyncLocalStorage.getStore()?.get('correlationId'),
  };

  constructor(
    modifyTitleTodo: TModifyTodoTitleCommand,
    public readonly ctx: Application.TContext,
  ) {
    super();
    this.id = modifyTitleTodo.id;
    this.title = modifyTitleTodo.title;
  }
}
