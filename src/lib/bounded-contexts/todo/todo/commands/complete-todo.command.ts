import { Application } from '@bitloops/bl-boilerplate-core';
import { CompleteTodoDto } from '@src/api/dto/complete-todo.dto';

export class CompleteTodoCommand extends Application.Command {
  public readonly id: string;
  public static readonly commandName = 'Todo.Todo.COMMAND.COMPLETE_TODO';
  constructor(addTodo: CompleteTodoDto) {
    super(CompleteTodoCommand.commandName, 'Todo');
    this.id = addTodo.todoId;
  }
  static getCommandTopic(): string {
    return super.getCommandTopic(CompleteTodoCommand.commandName, 'Todo');
  }
}
