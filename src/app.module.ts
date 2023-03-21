import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiModule } from './api/api.module';
import { TodoModule } from './bounded-contexts/todo/todo/todo.module';
import { AuthModule } from './infra/auth/auth.module';
import { MarketingModule } from './bounded-contexts/marketing/marketing/marketing.module';
import { IamModule } from './bounded-contexts/iam/iam/iam.module';
import { JetstreamModule } from '@src/bitloops/nest-jetstream';
import { PostgresModule } from './infra/db/postgres/postgres.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.development.env',
    }),
    JetstreamModule.forRoot({}),
    MongooseModule.forRoot('mongodb://localhost/todo'),
    PostgresModule.forRoot({
      database: process.env.PG_IAM_DATABASE ?? 'iam',
      host: process.env.PG_IAM_HOST ?? 'localhost',
      port: process.env.PG_IAM_PORT ? +process.env.PG_IAM_PORT : 5432,
      user: process.env.PG_IAM_USER ?? 'user',
      password: process.env.PG_IAM_PASSWORD ?? 'postgres',
      max: 20,
    }),
    TodoModule,
    ApiModule,
    AuthModule,
    MarketingModule,
    IamModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
