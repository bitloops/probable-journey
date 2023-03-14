import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { CommandHandlers } from './application/command-handlers';
import { EventHandlers } from './application/event-handlers';
import { TodoController } from '../../../../api/todo.controller';
import { QueryHandlers } from './application/query-handlers';
import { TodoWriteRepository } from '../../../../bounded-contexts/todo/todo/repository/todo-write.repository';
import { TodoWriteRepoPortToken } from './ports/TodoWriteRepoPort';
import {
  Todo,
  TodoSchema,
} from '../../../../bounded-contexts/todo/todo/repository/schema/todo.schema';
import { TodoReadRepoPortToken } from './ports/TodoReadRepoPort';
import { TodoReadRepository } from '../../../../bounded-contexts/todo/todo/repository/todo-read.repository';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: Todo.name, schema: TodoSchema }]),
  ],
  controllers: [TodoController],
  providers: [
    ...CommandHandlers,
    ...EventHandlers,
    ...QueryHandlers,
    {
      provide: TodoWriteRepoPortToken,
      useClass: TodoWriteRepository,
    },
    {
      provide: TodoReadRepoPortToken,
      useClass: TodoReadRepository,
    },
  ],
  exports: [...CommandHandlers, ...EventHandlers, ...QueryHandlers],
})
export class TodoModule {}
