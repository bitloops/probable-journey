import { Controller, Inject, Injectable, UseGuards } from '@nestjs/common';
import { RpcException, GrpcMethod, Payload } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { Metadata, ServerUnaryCall } from '@grpc/grpc-js';

import { todo } from '../proto/todo';

import { AddTodoCommand } from '../lib/bounded-contexts/todo/todo/commands/add-todo.command';

import { BUSES_TOKENS } from '@src/bitloops/nest-jetstream/buses/constants';
import { AuthEnvironmentVariables } from '@src/config/auth.configuration';
import {
  GetAuthData,
  JwtGrpcAuthGuard,
} from '@src/bitloops/nest-auth-passport';
import { Infra } from '@src/bitloops/bl-boilerplate-core';
// import { CompleteTodoCommand } from '@src/lib/bounded-contexts/todo/todo/commands/complete-todo.command';

@Injectable()
@Controller()
@UseGuards(JwtGrpcAuthGuard)
export class TodoGrpcController {
  private readonly JWT_SECRET: string;
  constructor(
    @Inject(BUSES_TOKENS.PUBSUB_COMMAND_BUS)
    private readonly commandBus: Infra.CommandBus.IPubSubCommandBus,
    @Inject(BUSES_TOKENS.PUBSUB_QUERY_BYS)
    private readonly queryBus: Infra.QueryBus.IQueryBus,
    private configService: ConfigService<AuthEnvironmentVariables, true>,
  ) {
    this.JWT_SECRET = this.configService.get('jwtSecret', { infer: true });
    if (this.JWT_SECRET === '') {
      throw new Error('JWT_SECRET is not defined in env!');
    }
  }

  @GrpcMethod('TodoApp', 'AddTodo')
  async addTodo(
    @Payload() data: todo.AddTodoRequest,
    metadata: Metadata, // @TODO figure out how to get the metadata https://github.com/nestjs/nest/issues/4851
    call: ServerUnaryCall<todo.AddTodoRequest, todo.AddTodoResponse>, // @TODO figure out how to get the call
    @GetAuthData() authData: any,
  ): Promise<todo.AddTodoResponse> {
    console.table([{ addTodo: 'here' }]);
    // console.log('metadata', metadata);
    // console.log('call', call);
    const command = new AddTodoCommand(
      { title: data.title },
      // {
      //   jwt: authData.jwt,
      //   userId: authData.user.id,
      // },
    );
    const results = await this.commandBus.request(command);
    if (results.isOk) {
      return new todo.AddTodoResponse({ id: results.data });
    } else {
      const error = results.error;
      console.error('Error while creating todo:', error?.message);
      throw new RpcException({
        code: error?.message || 'Failed to create the todo',
        message: error?.message || 'Failed to create the todo',
      });
    }
  }
}