import { Application } from '@bitloops/bl-boilerplate-core';
export type TUncompleteTodoCommand = {
  id: string;
};
export class UncompleteTodoCommand extends Application.Command {
  public readonly id: string;
  public static readonly commandName = 'Todo.UNCOMPLETE_TODO';
  constructor(uncompleteTodo: TUncompleteTodoCommand) {
    super(UncompleteTodoCommand.commandName, 'Todo');
    this.id = uncompleteTodo.id;
  }
  static getCommandTopic(): string {
    return super.getCommandTopic(UncompleteTodoCommand.commandName, 'Todo');
  }
}
