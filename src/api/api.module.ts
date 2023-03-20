import { Module } from '@nestjs/common';
import { AuthModule } from '@src/bounded-contexts/iam/authentication/auth.module';
import { AuthController } from './authentication.controller';
import { TodoController } from './todo.controller';
import { JetstreamModule } from '@src/bitloops/nest-jetstream';

@Module({
  imports: [AuthModule, JetstreamModule],
  controllers: [TodoController, AuthController],
})
export class ApiModule {}
