import { Application } from '@bitloops/bl-boilerplate-core';
export type TAddTodoCommand = {
  title: string;
  userId: string;
};
export class AddTodoCommandLegacy extends Application.Command {
  public readonly title: string;
  public readonly userId: string;
  public static readonly commandName = 'Todo.ADD_TODO';
  constructor(addTodo: TAddTodoCommand) {
    super(AddTodoCommandLegacy.commandName, 'Todo');
    this.title = addTodo.title;
    this.userId = addTodo.userId;
  }
  static getCommandTopic(): string {
    return super.getCommandTopic(AddTodoCommandLegacy.commandName, 'Todo');
  }
}

export class AddTodoCommand {
  public readonly boundedContext = 'Todo';
  public readonly createdAt = Date.now();
  constructor(
    public readonly title: string,
    public readonly userId: string,
    public readonly ctx: any,
  ) {}
}
