import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { TodoReadModel } from '../lib/bounded-contexts/todo/todo/domain/TodoReadModel';
import { AddTodoCommand } from '../lib/bounded-contexts/todo/todo/commands/add-todo.command';
import { AddTodoDto } from './dto/add-todo.dto';
import { GetTodosQuery } from '../lib/bounded-contexts/todo/todo/queries/get-todos.query';
import { LocalAuthGuard } from '@src/bounded-contexts/iam/authentication/local-auth.guard';
import { AuthService } from '@src/bounded-contexts/iam/authentication/auth.service';
import { LogInCommand } from '@src/lib/bounded-contexts/iam/authentication/commands/log-in.command';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly authService: AuthService,
  ) {}

  //   @Post()
  //   async addTodo(@Body() dto: AddTodoDto) {
  //     // userId get from context
  //     return this.commandBus.execute(
  //       new AddTodoCommand({ title: dto.title, userId: dto.userId }),
  //     );
  //   }

  //   @Get()
  //   async findAll(): Promise<TodoReadModel[]> {
  //     return this.queryBus.execute(new GetTodosQuery());
  //   }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    console.log('req', req);
    const jwt = this.authService.login(req.user);
    // this.commandBus.execute(
    //         new LogInCommand({ email: dto.title, password: dto.userId }),
    //       );
    return jwt;
  }
}
