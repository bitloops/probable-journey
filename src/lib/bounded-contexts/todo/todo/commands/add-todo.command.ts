import { Application } from '@bitloops/bl-boilerplate-core';
export type TAddTodoCommand = {
  title: string;
  userId: string;
};
export class AddTodoCommand extends Application.Command {
  public readonly title: string;
  public readonly userId: string;
  public static readonly commandName = 'Todo.ADD_TODO';
  constructor(createTodo: TAddTodoCommand) {
    super(AddTodoCommand.commandName, 'Todo');
    this.title = createTodo.title;
    this.userId = createTodo.userId;
  }
  static getCommandTopic(): string {
    return super.getCommandTopic(AddTodoCommand.commandName, 'Todo');
  }
}
