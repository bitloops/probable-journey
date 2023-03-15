import { Application } from '@bitloops/bl-boilerplate-core';
export type TAddTodoCommand = {
  title: string;
  userId: string;
};
export class AddTodoCommand extends Application.Command {
  public readonly title: string;
  public readonly userId: string;
  public static readonly commandName = 'Todo.ADD_TODO';
  constructor(addTodo: TAddTodoCommand) {
    super(AddTodoCommand.commandName, 'Todo');
    this.title = addTodo.title;
    this.userId = addTodo.userId;
  }
  static getCommandTopic(): string {
    return super.getCommandTopic(AddTodoCommand.commandName, 'Todo');
  }
}
