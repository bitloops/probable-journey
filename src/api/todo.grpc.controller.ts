import {
  Controller,
  Inject,
  Injectable,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RpcException, GrpcMethod, Payload } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { Metadata, ServerUnaryCall } from '@grpc/grpc-js';

import { todo } from '../proto/generated/todo';

import { AddTodoCommand } from '../lib/bounded-contexts/todo/todo/commands/add-todo.command';

import { BUSES_TOKENS } from '@bitloops/bl-boilerplate-infra-nest-jetsream';
import { AuthEnvironmentVariables } from '@src/config/auth.configuration';
import {
  AsyncLocalStorageInterceptor,
  JwtGrpcAuthGuard,
} from '@bitloops/bl-boilerplate-infra-nest-auth-passport';
import { Infra, asyncLocalStorage } from '@bitloops/bl-boilerplate-core';
import { CorrelationIdInterceptor } from '@bitloops/bl-boilerplate-infra-telemetry';
import { TodoReadModel } from '@src/lib/bounded-contexts/todo/todo/domain/TodoReadModel';
import { GetTodosQuery } from '@src/lib/bounded-contexts/todo/todo/queries/get-todos.query';
import { CompleteTodoCommand } from '@src/lib/bounded-contexts/todo/todo/commands/complete-todo.command';
import { UncompleteTodoCommand } from '@src/lib/bounded-contexts/todo/todo/commands/uncomplete-todo.command';
import { ModifyTodoTitleCommand } from '@src/lib/bounded-contexts/todo/todo/commands/modify-title-todo.command';
import { DeleteTodoCommand } from '@src/lib/bounded-contexts/todo/todo/commands/delete-todo.command';

// import { CompleteTodoCommand } from '@src/lib/bounded-contexts/todo/todo/commands/complete-todo.command';
async function sha256Hash(message: string) {
  // Convert the message to a Uint8Array
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  // Generate the hash
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  // Convert the hash to a hexadecimal string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hashHex;
}

@Injectable()
@Controller()
@UseGuards(JwtGrpcAuthGuard)
@UseInterceptors(CorrelationIdInterceptor, AsyncLocalStorageInterceptor)
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

  @GrpcMethod('TodoService', 'Add')
  async addTodo(
    data: todo.AddTodoRequest,
    metadata: Metadata,
    call: ServerUnaryCall<todo.AddTodoRequest, todo.AddTodoResponse>,
    // authData: any,
  ): Promise<todo.AddTodoResponse> {
    // console.log('metadata', metadata);
    // console.log('call', call);
    const context = asyncLocalStorage.getStore()?.get('context');
    const command = new AddTodoCommand({ title: data.title });
    const results = await this.commandBus.request(command);
    if (results.isOk) {
      return new todo.AddTodoResponse({
        ok: new todo.AddTodoOKResponse({ id: results.data }),
      });
    } else {
      const error = results.error;
      console.error('Error while creating todo:', error?.message);
      return new todo.AddTodoResponse({
        error: new todo.AddTodoErrorResponse({
          invalidTitleLengthError: new todo.ErrorResponse({
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

  @GrpcMethod('TodoService', 'GetAll')
  async getAll(
    data: todo.GetAllTodosRequest,
    metadata: Metadata, // @TODO figure out how to get the metadata https://github.com/nestjs/nest/issues/4851
    // call: ServerUnaryCall<todo.GetAllTodosRequest, todo.GetAllTodosResponse>, // @TODO figure out how to get the call
    // authData: any,
  ): Promise<todo.GetAllTodosResponse> {
    console.log('metadata', metadata.get('cache-hash'));
    // console.log('call', call);
    // const myTodo: todo.Todo = new todo.Todo({
    //   id: '1',
    //   title: 'test',
    //   completed: false,
    // });
    // return new todo.GetAllTodosResponse({
    //   ok: new todo.GetAllTodosOKResponse({
    //     todos: [myTodo],
    //   }),
    // });
    const results = await this.queryBus.request(new GetTodosQuery());
    // console.log('resutls', results);
    if (results.isOk) {
      const mappedData = results.data.map((i) => ({
        id: i.id,
        title: i.title,
        completed: i.completed,
      }));
      const dbHash = await sha256Hash(JSON.stringify(mappedData));
      const cachedHashesAreEqual = dbHash === metadata.get('cache-hash')[0];
      console.log('dbHash', dbHash);
      console.log('cachedHash', metadata.get('cache-hash')[0]);
      if (cachedHashesAreEqual) {
        throw new RpcException('CACHE_HIT');
      }
      // console.log('data', JSON.stringify(mappedData));
      // console.log('results hash', await sha256Hash(JSON.stringify(mappedData)));
      return new todo.GetAllTodosResponse({
        ok: new todo.GetAllTodosOKResponse({
          todos: mappedData.map((i) => new todo.Todo(i)),
        }),
      });
    } else {
      const error = results.error;
      console.error('Error while fetching todos:', error?.message);
      return new todo.GetAllTodosResponse({
        error: new todo.GetAllTodosErrorResponse({
          systemUnavailableError: new todo.ErrorResponse({
            code: error?.code || 'SYSTEM_UNAVAILABLE_ERROR',
            message: error?.message || 'The system is unavailable.',
          }),
        }),
      });
    }
  }

  @GrpcMethod('TodoService', 'Complete')
  async completeTodo(
    data: todo.CompleteTodoRequest,
  ): Promise<todo.CompleteTodoResponse> {
    const command = new CompleteTodoCommand({ todoId: data.id });
    const result = await this.commandBus.request(command);
    if (result.isOk) {
      return new todo.CompleteTodoResponse({
        ok: new todo.CompleteTodoOKResponse(),
      });
    } else {
      const error = result.error;
      console.error('Error while completing todo:', error?.message);
      return new todo.CompleteTodoResponse({
        error: new todo.CompleteTodoErrorResponse({
          systemUnavailableError: new todo.ErrorResponse({
            code: error?.code || 'SYSTEM_UNAVAILABLE_ERROR',
            message: error?.message || 'The system is unavailable.',
          }),
        }),
      });
    }
  }

  @GrpcMethod('TodoService', 'Uncomplete')
  async uncompleteTodo(
    data: todo.CompleteTodoRequest,
  ): Promise<todo.UncompleteTodoResponse> {
    const command = new UncompleteTodoCommand({ id: data.id });
    const result = await this.commandBus.request(command);
    if (result.isOk) {
      return new todo.UncompleteTodoResponse({
        ok: new todo.UncompleteTodoOKResponse(),
      });
    } else {
      const error = result.error;
      console.error('Error while uncompleting todo:', error?.message);
      return new todo.UncompleteTodoResponse({
        error: new todo.UncompleteTodoErrorResponse({
          systemUnavailableError: new todo.ErrorResponse({
            code: error?.code || 'SYSTEM_UNAVAILABLE_ERROR',
            message: error?.message || 'The system is unavailable.',
          }),
        }),
      });
    }
  }

  @GrpcMethod('TodoService', 'Delete')
  async deleteTodo(
    data: todo.DeleteTodoRequest,
  ): Promise<todo.DeleteTodoResponse> {
    const command = new DeleteTodoCommand({ id: data.id });
    const result = await this.commandBus.request(command);
    if (result.isOk) {
      return new todo.DeleteTodoResponse({
        ok: new todo.DeleteTodoOKResponse(),
      });
    } else {
      const error = result.error;
      console.error('Error while deleting todo:', error?.message);
      return new todo.DeleteTodoResponse({
        error: new todo.DeleteTodoErrorResponse({
          systemUnavailableError: new todo.ErrorResponse({
            code: error?.code || 'SYSTEM_UNAVAILABLE_ERROR',
            message: error?.message || 'The system is unavailable.',
          }),
        }),
      });
    }
  }

  @GrpcMethod('TodoService', 'ModifyTitle')
  async modifyTitle(
    data: todo.ModifyTitleTodoRequest,
  ): Promise<todo.ModifyTitleTodoResponse> {
    const command = new ModifyTodoTitleCommand({
      id: data.id,
      title: data.title,
    });
    const result = await this.commandBus.request(command);
    if (result.isOk) {
      return new todo.ModifyTitleTodoResponse({
        ok: new todo.ModifyTitleTodoOKResponse(),
      });
    } else {
      const error = result.error;
      console.error('Error while  todo:', error?.message);
      return new todo.ModifyTitleTodoResponse({
        error: new todo.ModifyTitleTodoErrorResponse({
          systemUnavailableError: new todo.ErrorResponse({
            code: error?.code || 'SYSTEM_UNAVAILABLE_ERROR',
            message: error?.message || 'The system is unavailable.',
          }),
        }),
      });
    }
  }
}
