import { Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthModule } from '@src/bounded-contexts/iam/authentication/auth.module';
import { TodoModule } from '@src/bounded-contexts/todo/todo/todo.module';
import {
  PubSubCommandBus,
  PubSubCommandBusToken,
} from '@src/infra/jetstream/buses/nats-pubsub-command-bus';
import {
  PubSubQueryBus,
  PubSubQueryBusToken,
} from '@src/infra/jetstream/buses/nats-pubsub-query-bus';
import { PubSubCommandHandlers } from '@src/lib/bounded-contexts/todo/todo/application/command-handlers';
import { PubSubQueryHandlers } from '@src/lib/bounded-contexts/todo/todo/application/query-handlers';
import { AuthController } from './authentication.controller';
// import { TodoCompletedDomainToIntegrationEventHandler } from '@src/lib/bounded-contexts/todo/todo/application/event-handlers/domain/todo-completed.handler';
import { TodoController } from './todo.controller';
import { TodosController } from './todos.controller';

const pubSubCommandHandlers: Provider<any>[] = [
  {
    provide: 'PubSubCommandHandlers',
    useFactory: (commandBus: PubSubCommandBus, ...args) => {
      console.log('pubSubCommandHandler', pubSubCommandHandlers);
      args.forEach((handler) => {
        const command = handler.command;
        const boundedContext = handler.boundedContext;
        commandBus.pubSubSubscribe(
          `${boundedContext}.${command?.name}`,
          handler,
        );
      });
      [...args];
      return;
    },
    inject: [
      { token: PubSubCommandBusToken, optional: false },
      ...PubSubCommandHandlers,
    ],
  },
];
const pubSubQueryHandlers: Provider<any>[] = [
  {
    provide: 'PubSubQueryHandlers',
    useFactory: (queryBus: PubSubQueryBus, ...args) => {
      console.log('pubSubQueryHandler', pubSubQueryHandlers);
      args.forEach((handler) => {
        const query = handler.query;
        const boundedContext = handler.boundedContext;
        console.log('subscribe', `${boundedContext}.${query?.name}`, handler);
        queryBus.pubSubSubscribe(`${boundedContext}.${query?.name}`, handler);
      });
      [...args];
      return;
    },
    inject: [
      { token: PubSubQueryBusToken, optional: false },
      ...PubSubQueryHandlers,
    ],
  },
];
@Module({
  imports: [
    AuthModule,
    CqrsModule,
    TodoModule,
    // JetstreamModule.forFeature({
    //   pubSubCommandHandlers: [...PubSubCommandHandlers],
    // }),
  ],
  providers: [
    ...pubSubCommandHandlers,
    ...pubSubQueryHandlers,
    // CommandBus,
    // {
    //   provide: 'SIMPLE_NATS',
    //   useClass: NestjsJetstream,
    // },
    // AuthService,
    // UsersService,
    // JwtService,
  ],
  controllers: [TodoController, TodosController, AuthController],
})
export class ApiModule {}
