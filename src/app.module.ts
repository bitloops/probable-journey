import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { JetstreamModule } from './infra/jetstream/jetstream.module';
import { ApiModule } from './api/api.module';
import { TodoModule } from './bounded-contexts/todo/todo/todo.module';
import { AuthModule } from './bounded-contexts/iam/authentication/auth.module';
import { UsersModule } from './bounded-contexts/iam/users/users.module';
import { MarketingModule } from './bounded-contexts/marketing/marketing/marketing.module';
import { IamModule } from './bounded-contexts/iam/iam.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.development.env',
    }),
    PrometheusModule.register(),
    JetstreamModule.forRoot({}),
    MongooseModule.forRoot('mongodb://localhost/todo'),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      synchronize: true,
      autoLoadEntities: true,
    }),
    TodoModule,
    ApiModule,
    AuthModule,
    UsersModule,
    MarketingModule,
    IamModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
