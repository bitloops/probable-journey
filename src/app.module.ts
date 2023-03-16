import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { JetstreamModule } from './infra/jetstream/jetstream.module';
import { ApiModule } from './api/api.module';
import { TodoModule } from './bounded-contexts/todo/todo/todo.module';
import { AuthModule } from './bounded-contexts/iam/authentication/auth.module';
import { UsersModule } from './bounded-contexts/iam/users/users.module';
import { MarketingModule } from './bounded-contexts/marketing/marketing/marketing.module';

@Module({
  imports: [
    JetstreamModule.forRoot({
      name: 'test',
    }),
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
