import { Module } from '@nestjs/common';
import { AuthModule } from '@src/infra/auth/auth.module';
import { AuthController } from './authentication.controller';
import { TodoController } from './todo.rest.controller';
import { TodoGrpcController } from './todo.grpc.controller';
import { JetstreamModule } from '@src/bitloops/nest-jetstream';

@Module({
  imports: [AuthModule, JetstreamModule],
  controllers: [AuthController, TodoController, TodoGrpcController],
})
export class ApiModule {}

// @Module({
//   imports: [JwtAuthModule, JetstreamModule],
//   controllers: [TodoController],
// })
// export class ApiTodoModule {}
