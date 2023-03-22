import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@src/infra/auth/auth.module';
import { AuthController } from './authentication.controller';
import { TodoController } from './todo.rest.controller';
import { TodoGrpcController } from './todo.grpc.controller';
import { JetstreamModule } from '@src/bitloops/nest-jetstream';
import configuration from '@src/config/configuration';
import authConfiguration from '@src/config/auth.configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.development.env',
      load: [configuration, authConfiguration],
    }),
    AuthModule,
    JetstreamModule.forRoot({}),
  ],
  controllers: [AuthController, TodoController, TodoGrpcController],
})
export class ApiModule {}

// @Module({
//   imports: [JwtAuthModule, JetstreamModule],
//   controllers: [TodoController],
// })
// export class ApiTodoModule {}
