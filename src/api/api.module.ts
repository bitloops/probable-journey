import { Module } from '@nestjs/common';
import { AuthModule } from '@src/infra/auth/auth.module';
import { AuthController } from './authentication.controller';
import { TodoController } from './todo.controller';
import { JetstreamModule } from '@src/bitloops/nest-jetstream';

@Module({
  imports: [AuthModule, JetstreamModule],
  controllers: [AuthController, TodoController],
})
export class ApiModule {}

// @Module({
//   imports: [JwtAuthModule, JetstreamModule],
//   controllers: [TodoController],
// })
// export class ApiTodoModule {}
