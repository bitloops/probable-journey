import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import * as jwtwebtoken from 'jsonwebtoken';
import { TodoReadModel } from '../lib/bounded-contexts/todo/todo/domain/TodoReadModel';
import { AddTodoCommandLegacy } from '../lib/bounded-contexts/todo/todo/commands/add-todo.command';
import { AddTodoDto } from './dto/add-todo.dto';
import { GetTodosQuery } from '../lib/bounded-contexts/todo/todo/queries/get-todos.query';

@Controller('todo')
export class TodoController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async addTodo(@Body() dto: AddTodoDto) {
    // userId get from context
    return this.commandBus.execute(
      new AddTodoCommandLegacy({ title: dto.title, userId: dto.userId }),
    );
  }

  @Get()
  async findAll(): Promise<TodoReadModel[]> {
    const jwt = jwtwebtoken.sign(
      { userId: 'vasilis' },
      'p2s5v8x/A?D(G+KbPeShVmYq3t6w9z$B',
    );
    const results = await this.queryBus.execute(new GetTodosQuery({ jwt }));
    if (results.isOk) return results.value;
    else throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }
}
