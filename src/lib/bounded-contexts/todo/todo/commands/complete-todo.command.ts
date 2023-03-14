import { Application } from '@bitloops/bl-boilerplate-core';
export type TCompleteTodoCommand = {
  id: string;
};
export class CompleteTodoCommand extends Application.Command {
  public readonly id: string;
  public static readonly commandName = 'Todo.Todo.COMMAND.COMPLETE_TODO';
  constructor(createTodo: TCompleteTodoCommand) {
    super(CompleteTodoCommand.commandName, 'Todo');
    this.id = createTodo.id;
  }
  static getCommandTopic(): string {
    return super.getCommandTopic(CompleteTodoCommand.commandName, 'Todo');
  }
}
