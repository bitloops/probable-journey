import { Controller, Inject, Injectable, UseGuards } from '@nestjs/common';
import { RpcException, GrpcMethod } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

import { todo } from '../proto/todo';

import { TodoReadModel } from '../lib/bounded-contexts/todo/todo/domain/TodoReadModel';
import { AddTodoCommand } from '../lib/bounded-contexts/todo/todo/commands/add-todo.command';
import { AddTodoDto } from './dto/add-todo.dto';
import { CompleteTodoDto } from './dto/complete-todo.dto';
import { GetTodosQuery } from '../lib/bounded-contexts/todo/todo/queries/get-todos.query';

import { BUSES_TOKENS } from '@src/bitloops/nest-jetstream/buses/constants';
import { PubSubCommandBus } from '@src/bitloops/nest-jetstream/buses/nats-pubsub-command-bus';
import { PubSubQueryBus } from '@src/bitloops/nest-jetstream/buses/nats-pubsub-query-bus';
import { JwtGrpcAuthGuard } from '@src/infra/auth/jwt-grpc-auth.guard';
import { GetUser } from '@src/infra/auth/user.decorator';
// import { CompleteTodoCommand } from '@src/lib/bounded-contexts/todo/todo/commands/complete-todo.command';

@Injectable()
@Controller()
@UseGuards(JwtGrpcAuthGuard)
export class TodoGrpcController {
  private readonly JWT_SECRET: string;
  constructor(
    @Inject(BUSES_TOKENS.PUBSUB_COMMAND_BUS)
    private readonly commandBus: PubSubCommandBus, // private readonly queryBus: QueryBus, // @Inject('NATS_JETSTREAM') private readonly nc: any,
    @Inject(BUSES_TOKENS.PUBSUB_QUERY_BYS)
    private readonly queryBus: PubSubQueryBus,
    private configService: ConfigService,
  ) {
    this.JWT_SECRET = this.configService.get<string>('JWT_SECRET') || '';

    if (this.JWT_SECRET === '') {
      throw new Error('JWT_SECRET is not defined!');
    }
  }

  private getJWTToken(req: any): string {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split('Bearer ')[1];
      return token;
    }
    return '';
  }

  @GrpcMethod('TodoApp', 'AddTodo')
  async addTodo(
    request: todo.AddTodoRequest,
    @GetUser() user: any,
  ): Promise<todo.AddTodoResponse> {
    const command = new AddTodoCommand(request.title, {
      jwt: user.token,
      userId: user.userId,
    });
    const results = await this.commandBus.request(command);
    if (results.isOk) return new todo.AddTodoResponse(results.data);
    else {
      const error = results.error;
      console.error('Error while creating todo:', error?.message);
      throw new RpcException({
        code: error?.message || 'Failed to create the todo',
        message: error?.message || 'Failed to create the todo',
      });
    }
  }
}
