import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
import { AuthModule } from '@src/bounded-contexts/iam/authentication/auth.module';
import { AuthService } from '@src/bounded-contexts/iam/authentication/auth.service';
import { UsersService } from '@src/bounded-contexts/iam/users/users.service';
import { NestjsJetstream } from '@src/infra/jetstream/nestjs-jetstream.class';
import { CommandHandlers } from '@src/lib/bounded-contexts/todo/todo/application/command-handlers';
import { TodoCompletedDomainToIntegrationEventHandler } from '@src/lib/bounded-contexts/todo/todo/application/event-handlers/domain/todo-completed.handler';
import { JetstreamModule } from '../infra/jetstream/jetstream.module';
import { AuthController } from './authentication.controller';
import { TodoController } from './todo.controller';
import { TodosController } from './todos.controller';

@Module({
  imports: [
    AuthModule,
    CqrsModule,
    JetstreamModule.forFeature({
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
  providers: [
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
