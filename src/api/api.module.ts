import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CommandHandlers } from '@src/lib/bounded-contexts/todo/todo/application/command-handlers';
import { TodoCompletedDomainToIntegrationEventHandler } from '@src/lib/bounded-contexts/todo/todo/application/event-handlers/domain/todo-completed.handler';
import { JetstreamModule } from '../infra/jetstream/jetstream.module';
import { TodoController } from './todo.controller';
import { TodosController } from './todos.controller';

@Module({
  imports: [
    CqrsModule,
    JetstreamModule.registerFeature({
      featureSubjectPrefix: '', // Events will be published with this prefix.
      subscriptions: [
        {
          name: 'test.test-subject', // Insert the consumer delivery target
        },
      ],
      eventHandlers: {
        // TodoCompletedDomainEvent: (data, ack, raw) =>
        //   new TodoCompletedDomainToIntegrationEventHandler().handle({
        //     data,
        //     metadata: { ack: ack as () => Promise<void> },
        //   }),
        // 'USER.UserLoggedInEvent': (data, ack, raw) =>
        //   new UserLoggedInEvent(data, ack, raw),
        // 'USER.UserRegisteredEvent': (data, ack, raw) =>
        //   new UserRegisteredEvent(data, ack, raw),
        // 'USER.EmailVerifiedEvent': (data, ack, raw) =>
        //   new EmailVerifiedEvent(data, ack, raw),
      },
    }),
  ],
  // providers: [...CommandHandlers],
  controllers: [TodoController, TodosController],
})
export class ApiModule {}
