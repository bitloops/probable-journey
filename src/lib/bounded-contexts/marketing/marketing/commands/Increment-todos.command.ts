import { Application } from '@bitloops/bl-boilerplate-core';
import { IncrementTodosDTO } from '../dtos/increment-todos.dto';


export class IncrementTodosCommand extends Application.Command {
  public userId: string;

  // Set static name so we can refer to them easily
  public static readonly commandName = 'Marketing.INCREMENT_DEPOSITS';

  constructor(incrementTodosDTO: IncrementTodosDTO) {
    super(IncrementTodosCommand.commandName, 'Marketing');
    this.userId = incrementTodosDTO.userId;
  }

  static getCommandTopic(): string {
    return super.getCommandTopic(IncrementTodosCommand.commandName, 'Marketing');
  }
}
