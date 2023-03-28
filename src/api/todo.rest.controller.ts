import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TodoReadModel } from '../lib/bounded-contexts/todo/todo/domain/TodoReadModel';
import { AddTodoCommand } from '../lib/bounded-contexts/todo/todo/commands/add-todo.command';
import { AddTodoDto } from './dto/add-todo.dto';
import { CompleteTodoDto } from './dto/complete-todo.dto';
import { GetTodosQuery } from '../lib/bounded-contexts/todo/todo/queries/get-todos.query';

import { BUSES_TOKENS } from '@src/bitloops/nest-jetstream/buses/constants';
import { AuthEnvironmentVariables } from '@src/config/auth.configuration';
import { JwtAuthGuard } from '@src/bitloops/nest-auth-passport';
import { Traceable } from '@src/bitloops/tracing';
import { Infra } from '@src/bitloops/bl-boilerplate-core';
// import { CompleteTodoCommand } from '@src/lib/bounded-contexts/todo/todo/commands/complete-todo.command';

@Injectable()
@Controller('todo')
export class TodoController {
  private readonly JWT_SECRET: string;
  constructor(
    @Inject(BUSES_TOKENS.PUBSUB_COMMAND_BUS)
    private readonly commandBus: Infra.CommandBus.IPubSubCommandBus,
    @Inject(BUSES_TOKENS.PUBSUB_QUERY_BYS)
    private readonly queryBus: Infra.QueryBus.IQueryBus,
    private configService: ConfigService<AuthEnvironmentVariables, true>,
  ) {
    this.JWT_SECRET = this.configService.get('jwtSecret', {
      infer: true,
    });

    if (this.JWT_SECRET === '') {
      throw new Error('JWT_SECRET is not defined!');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @Traceable({
    operation: 'TodoController',
  })
  async addTodo(@Request() req, @Body() dto: AddTodoDto) {
    // const jwt = jwtwebtoken.sign({ userId: dto.userId }, this.JWT_SECRET);
    const command = new AddTodoCommand({ title: dto.title });
    const results = await this.commandBus.request(command);
    if (results.isOk) return results.data;
    else throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }

  @Post('/complete')
  async completeTodo(@Body() dto: CompleteTodoDto) {
    // userId get from context
    // return this.commandBus.execute(
    //   new CompleteTodoCommand({ todoId: dto.todoId }),
    // );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req): Promise<TodoReadModel[]> {
    // const jwt = jwtwebtoken.sign({ userId: 'vasilis' }, this.JWT_SECRET);
    const results = await this.queryBus.request(
      new GetTodosQuery({ jwt: this.getJWTToken(req) }),
    );
    if (results.isOk) return results.data;
    else throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }

  private getJWTToken(req: any): string {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split('Bearer ')[1];
      return token;
    }
    return '';
  }
}
