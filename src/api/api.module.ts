import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './authentication.controller';
import { TodoController } from './todo.rest.controller';
import { TodoGrpcController } from './todo.grpc.controller';
import { JetstreamModule } from '@src/bitloops/nest-jetstream';
import configuration from '@src/config/configuration';
import authConfiguration, {
  AuthEnvironmentVariables,
} from '@src/config/auth.configuration';
import { AuthModule } from '@src/bitloops/nest-auth-passport';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.development.env',
      load: [configuration, authConfiguration],
    }),
    AuthModule.forRootAsync({
      jwtOptions: {
        useFactory: (
          configService: ConfigService<AuthEnvironmentVariables, true>,
        ) => ({
          secret: configService.get('jwtSecret'),
          signOptions: { expiresIn: '3600s' },
        }),
        inject: [ConfigService],
      },
      postgresOptions: {
        useFactory: (
          configService: ConfigService<AuthEnvironmentVariables, true>,
        ) => ({
          database: configService.get('database.database', { infer: true }),
          host: configService.get('database.host', { infer: true }),
          port: configService.get('database.port', { infer: true }),
          user: configService.get('database.user', { infer: true }),
          password: configService.get('database.password', { infer: true }),
          max: 20,
        }),
        inject: [ConfigService],
      },
    }),
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
