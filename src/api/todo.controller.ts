import { Body, Controller, Get, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { TodoReadModel } from '../lib/bounded-contexts/todo/todo/domain/TodoReadModel';
import { AddTodoCommand } from '../lib/bounded-contexts/todo/todo/commands/add-todo.command';
import { AddTodoDto } from './dto/add-todo.dto';
import { CompleteTodoDto } from './dto/complete-todo.dto';
import { GetTodosQuery } from '../lib/bounded-contexts/todo/todo/queries/get-todos.query';
import { CompleteTodoCommand } from '@src/lib/bounded-contexts/todo/todo/commands/complete-todo.command';

@Controller('todo')
export class TodoController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  @Post()
  async addTodo(@Body() dto: AddTodoDto) {
    // userId get from context
    return this.commandBus.execute(
      new AddTodoCommand({ title: dto.title, userId: dto.userId }),
    );
  }

  @Post('/complete')
  async completeTodo(@Body() dto: CompleteTodoDto) {
    // userId get from context
    return this.commandBus.execute(
      new CompleteTodoCommand({ todoId: dto.todoId }),
    );
  }

  @Get()
  async findAll(): Promise<TodoReadModel[]> {
    return this.queryBus.execute(new GetTodosQuery());
  }
}
