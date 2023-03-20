import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TodoWriteRepository } from './repository/todo-write.repository';
import { Todo, TodoSchema } from './repository/schema/todo.schema';
import { TodoReadRepository } from './repository/todo-read.repository';
import { TodoModule as LibTodoModule } from 'src/lib/bounded-contexts/todo/todo/todo.module';
import { TodoWriteRepoPortToken } from '@src/lib/bounded-contexts/todo/todo/ports/TodoWriteRepoPort';
import { TodoReadRepoPortToken } from '@src/lib/bounded-contexts/todo/todo/ports/TodoReadRepoPort';
import { MongoModule } from '@src/infra/db/mongo/mongo.module';
import { PubSubCommandHandlers } from '@src/lib/bounded-contexts/todo/todo/application/command-handlers';
import { PubSubQueryHandlers } from '@src/lib/bounded-contexts/todo/todo/application/query-handlers';
import {
  StreamingDomainEventHandlers,
  StreamingIntegrationEventHandlers,
} from '@src/lib/bounded-contexts/todo/todo/application/event-handlers';
import { StreamingIntegrationEventBusToken } from '@src/lib/bounded-contexts/todo/todo/constants';
import { NatsStreamingIntegrationEventBus } from '@src/bitloops/nest-jetstream/buses/nats-streaming-integration-event-bus';
import { JetstreamModule } from '@src/bitloops/nest-jetstream';

const RepoProviders = [
  {
    provide: TodoWriteRepoPortToken,
    useClass: TodoWriteRepository,
  },
  {
    provide: TodoReadRepoPortToken,
    useClass: TodoReadRepository,
  },
  {
    provide: StreamingIntegrationEventBusToken,
    useClass: NatsStreamingIntegrationEventBus,
  },
];
@Module({
  imports: [
    LibTodoModule.register({
      imports: [
        MongooseModule.forFeature([{ name: Todo.name, schema: TodoSchema }]),
        MongoModule,
        JetstreamModule.forFeature({
          moduleOfHandlers: TodoModule,
          pubSubCommandHandlers: [...PubSubCommandHandlers],
          pubSubQueryHandlers: [...PubSubQueryHandlers],
          streamingDomainEventHandlers: [...StreamingDomainEventHandlers],
          streamingIntegrationEventHandlers: [
            ...StreamingIntegrationEventHandlers,
          ],
        }),
      ],
      inject: [...RepoProviders],
    }),
  ],
  exports: [LibTodoModule],
})
export class TodoModule {}
