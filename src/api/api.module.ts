import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@src/infra/auth/auth.module';
import { AuthController } from './authentication.controller';
import { TodoController } from './todo.rest.controller';
import { TodoGrpcController } from './todo.grpc.controller';
import { JetstreamModule } from '@src/bitloops/nest-jetstream';
import { PostgresModule } from '@src/infra/db/postgres/postgres.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.development.env',
    }),
    AuthModule,
    JetstreamModule.forRoot({}),
    PostgresModule.forRoot({
      database: process.env.PG_IAM_DATABASE ?? 'iam',
      host: process.env.PG_IAM_HOST ?? 'localhost',
      port: process.env.PG_IAM_PORT ? +process.env.PG_IAM_PORT : 5432,
      user: process.env.PG_IAM_USER ?? 'user',
      password: process.env.PG_IAM_PASSWORD ?? 'postgres',
      max: 20,
    }),
  ],
  controllers: [AuthController, TodoController, TodoGrpcController],
})
export class ApiModule {}

// @Module({
//   imports: [JwtAuthModule, JetstreamModule],
//   controllers: [TodoController],
// })
// export class ApiTodoModule {}
