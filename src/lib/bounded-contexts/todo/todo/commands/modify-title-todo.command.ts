import { Application } from '@bitloops/bl-boilerplate-core';
export type TModifyTodoTitleCommand = {
  id: string;
  title: string;
};
export class ModifyTodoTitleCommand extends Application.Command {
  public readonly id: string;
  public readonly title: string;

  public static readonly commandName = 'Todo.MODIFY_TODO_TITLE';
  constructor(modifyTitleTodo: TModifyTodoTitleCommand) {
    super(ModifyTodoTitleCommand.commandName, 'Todo');
    this.id = modifyTitleTodo.id;
    this.title = modifyTitleTodo.title;
  }
  static getCommandTopic(): string {
    return super.getCommandTopic(ModifyTodoTitleCommand.commandName, 'Todo');
  }
}
