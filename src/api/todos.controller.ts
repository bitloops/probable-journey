import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Post,
} from '@nestjs/common';
import * as jwtwebtoken from 'jsonwebtoken';
// import { CommandBus, QueryBus } from '@nestjs/cqrs';
// import { NatsJetStreamContext } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
// import {
//   Ctx,
//   EventPattern,
//   MessagePattern,
//   Payload,
// } from '@nestjs/microservices';
import { TodoReadModel } from '../lib/bounded-contexts/todo/todo/domain/TodoReadModel';
import { AddTodoCommand } from '../lib/bounded-contexts/todo/todo/commands/add-todo.command';
import { AddTodoDto } from './dto/add-todo.dto';
import { GetTodosQuery } from '../lib/bounded-contexts/todo/todo/queries/get-todos.query';
import {
  PubSubCommandBus,
  PubSubCommandBusToken,
} from '@src/infra/jetstream/buses/nats-pubsub-command-bus';
import {
  PubSubQueryBus,
  PubSubQueryBusToken,
} from '@src/infra/jetstream/buses/nats-pubsub-query-bus';

const JWT_SECRET = 'p2s5v8x/A?D(G+KbPeShVmYq3t6w9z$B';

@Injectable()
@Controller('todos')
export class TodosController {
  constructor(
    @Inject(PubSubCommandBusToken)
    private readonly commandBus: PubSubCommandBus, // private readonly queryBus: QueryBus, // @Inject('NATS_JETSTREAM') private readonly nc: any,
    @Inject(PubSubQueryBusToken)
    private readonly queryBus: PubSubQueryBus,
  ) {}

  @Post()
  async addTodo(@Body() dto: AddTodoDto) {
    // userId get from context
    const jwt = jwtwebtoken.sign({ userId: dto.userId }, JWT_SECRET);
    const command = new AddTodoCommand(dto.title, dto.userId, { jwt });
    const results = await this.commandBus.request(command);
    if (results.isOk) return results.data;
    else throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }

  @Get()
  async findAll(): Promise<TodoReadModel[]> {
    const jwt = jwtwebtoken.sign({ userId: 'vasilis' }, JWT_SECRET);
    const results = await this.queryBus.request(new GetTodosQuery({ jwt }));
    if (results.isOk) return results.data;
    else throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }
}
