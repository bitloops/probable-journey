import { Module } from '@nestjs/common';
import { TodoModule } from './bounded-contexts/todo/todo/todo.module';
import { MarketingModule } from './bounded-contexts/marketing/marketing/marketing.module';
import { IamModule } from './bounded-contexts/iam/iam/iam.module';
import {
  JetstreamModule,
  NatsStreamingMessageBus,
} from '@src/bitloops/nest-jetstream';
import { PostgresModule } from './bitloops/postgres/postgres.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import authConfiguration from './config/auth.configuration';
import { MongoModule } from '@bitloops/mongo';
import { TracingModule } from '@bitloops/tracing';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.development.env',
      load: [configuration, authConfiguration],
    }),
    JetstreamModule.forRoot({}),
    PostgresModule.forRoot({
      database: process.env.PG_IAM_DATABASE ?? 'iam',
      host: process.env.PG_IAM_HOST ?? 'localhost',
      port: process.env.PG_IAM_PORT ? +process.env.PG_IAM_PORT : 5432,
      user: process.env.PG_IAM_USER ?? 'user',
      password: process.env.PG_IAM_PASSWORD ?? 'postgres',
      max: 20,
    }),
    MongoModule.forRoot({
      url: 'mongodb://localhost:30001/?directConnection=true&replicaSet=my-replica-set',
    }),

    TodoModule,
    MarketingModule,
    IamModule,
    TracingModule.register({
      messageBus: NatsStreamingMessageBus,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
