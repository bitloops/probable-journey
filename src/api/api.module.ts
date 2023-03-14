import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TodoController } from './todo.controller';

@Module({
  imports: [CqrsModule],
  controllers: [TodoController],
})
export class ApiModule {}
