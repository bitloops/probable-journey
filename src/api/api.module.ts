import { Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TodoModule } from '@src/bounded-contexts/todo/todo/todo.module';
import {
  PubSubCommandBus,
  PubSubCommandBusToken,
} from '@src/infra/jetstream/buses/nats-pubsub-command-bus';
import { NestjsJetstream } from '@src/infra/jetstream/nestjs-jetstream.class';
import {
  CommandHandlers,
  PubsubCommandHandlers,
} from '@src/lib/bounded-contexts/todo/todo/application/command-handlers';
import { TodoCompletedDomainToIntegrationEventHandler } from '@src/lib/bounded-contexts/todo/todo/application/event-handlers/domain/todo-completed.handler';
import { JetstreamModule } from '../infra/jetstream/jetstream.module';
import { TodoController } from './todo.controller';
import { TodosController } from './todos.controller';

const pubsubCommandHandlers: Provider<any>[] = [
  {
    provide: 'PubsubCommandHandlers',
    useFactory: (commandBus: PubSubCommandBus, ...args) => {
      console.log('pubsubCommandHandler', pubsubCommandHandlers);
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
      ...PubsubCommandHandlers,
    ],
  },
];
@Module({
  imports: [
    CqrsModule,
    TodoModule,
    // JetstreamModule.forFeature({
    //   pubsubCommandHandlers: [...PubsubCommandHandlers],
    // }),
  ],
  providers: [
    ...pubsubCommandHandlers,
    // CommandBus,
    // {
    //   provide: 'SIMPLE_NATS',
    //   useClass: NestjsJetstream,
    // },
  ],
  controllers: [TodoController, TodosController],
})
export class ApiModule {}
