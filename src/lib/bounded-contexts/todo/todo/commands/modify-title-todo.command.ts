import { Application } from '@bitloops/bl-boilerplate-core';
export type TModifyTodoTitleCommand = {
  id: string;
  title: string;
};
export class ModifyTodoTitleCommand extends Application.Command {
  public readonly id: string;
  public readonly title: string;
  metadata: Application.TCommandMetadata;

  constructor(modifyTitleTodo: TModifyTodoTitleCommand) {
    super();
    this.id = modifyTitleTodo.id;
    this.title = modifyTitleTodo.title;
  }
}
