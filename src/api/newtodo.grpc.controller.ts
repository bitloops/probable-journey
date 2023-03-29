import { Controller, Inject, Injectable, UseGuards } from '@nestjs/common';
import { RpcException, GrpcMethod, Payload } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { Metadata, ServerUnaryCall } from '@grpc/grpc-js';

import { newtodo } from '../proto/generated/newtodo';

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
    @Payload() data: newtodo.AddTodoRequest,
    metadata: Metadata, // @TODO figure out how to get the metadata https://github.com/nestjs/nest/issues/4851
    call: ServerUnaryCall<newtodo.AddTodoRequest, newtodo.AddTodoResponse>, // @TODO figure out how to get the call
    @GetAuthData() authData: any,
  ): Promise<newtodo.AddTodoResponse> {
    // console.log('metadata', metadata);
    // console.log('call', call);
    const command = new AddTodoCommand(
      { title: data.title },
      {
        jwt: authData.jwt,
        userId: authData.user.id,
      },
    );
    const results = await this.commandBus.request(command);
    if (results.isOk) {
      return new newtodo.AddTodoResponse({
        ok: new newtodo.AddTodoOKResponse({ id: results.data }),
      });
    } else {
      const error = results.error;
      console.error('Error while creating todo:', error?.message);
      return new newtodo.AddTodoResponse({
        error: new newtodo.AddTodoErrorResponse({
          invalidTitleLengthError: new newtodo.ErrorResponse({
            code: error?.code || 'INVALID_TITLE_LENGTH_ERROR',
            message: error?.message || 'The title is too long.',
          }),
        }),
      });
      // throw new RpcException({
      //   code: error?.message || 'Failed to create the todo',
      //   message: error?.message || 'Failed to create the todo',
      // });
    }
  }
}
