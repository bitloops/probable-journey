import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CatsModule } from './cats/cats.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { JetstreamModule } from './infra/jetstream/jetstream.module';
import { HeroesModule } from './heroes/heroes.module';
import { ApiModule } from './api/api.module';
import { TodoModule } from './bounded-contexts/todo/todo/todo.module';
import { AuthModule } from './bounded-contexts/iam/authentication/auth.module';
import { UsersModule } from './bounded-contexts/iam/users/users.module';

@Module({
  imports: [
    JetstreamModule.register({}),
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
    CatsModule,
    HeroesModule,
    TodoModule,
    ApiModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
