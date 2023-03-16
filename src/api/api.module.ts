import { Module } from '@nestjs/common';
import { JetstreamModule } from '@src/infra/jetstream/jetstream.module';
import { AuthModule } from '@src/bounded-contexts/iam/authentication/auth.module';
import { AuthController } from './authentication.controller';
import { TodoController } from './todo.controller';

@Module({
  imports: [AuthModule, JetstreamModule],
  controllers: [TodoController, AuthController],
})
export class ApiModule {}
