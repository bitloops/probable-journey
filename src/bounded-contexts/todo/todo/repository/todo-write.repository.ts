import {
  Application,
  Domain,
  Either,
  Infra,
  ok,
} from '@bitloops/bl-boilerplate-core';
import { Injectable, Inject } from '@nestjs/common';
import { Collection, MongoClient } from 'mongodb';
import * as jwtwebtoken from 'jsonwebtoken';
import { TodoWriteRepoPort } from 'src/lib/bounded-contexts/todo/todo/ports/TodoWriteRepoPort';
import { TodoEntity } from 'src/lib/bounded-contexts/todo/todo/domain/TodoEntity';
import { ConfigService } from '@nestjs/config';
import { AuthEnvironmentVariables } from '@src/config/auth.configuration';
import { StreamingDomainEventBusToken } from '@src/lib/bounded-contexts/todo/todo/constants';
import { asyncLocalStorage } from '@src/bitloops/tracing';

const MONGO_DB_DATABASE = process.env.MONGO_DB_DATABASE || 'todo';
const MONGO_DB_TODO_COLLECTION =
  process.env.MONGO_DB_TODO_COLLECTION || 'todos';

@Injectable()
export class TodoWriteRepository implements TodoWriteRepoPort {
  private collectionName = MONGO_DB_TODO_COLLECTION;
  private dbName = MONGO_DB_DATABASE;
  private collection: Collection;
  private JWT_SECRET: string;

  constructor(
    @Inject('MONGO_DB_CONNECTION') private client: MongoClient,
    @Inject(StreamingDomainEventBusToken)
    private readonly domainEventBus: Infra.EventBus.IEventBus,
    private configService: ConfigService<AuthEnvironmentVariables, true>,
  ) {
    this.collection = this.client
      .db(this.dbName)
      .collection(this.collectionName);

    this.JWT_SECRET = this.configService.get('jwtSecret', { infer: true });
  }

  @Application.Repo.Decorators.ReturnUnexpectedError()
  async getById(
    id: Domain.UUIDv4,
  ): Promise<Either<TodoEntity | null, Application.Repo.Errors.Unexpected>> {
    const { jwt } = asyncLocalStorage.getStore()?.get('context');
    let jwtPayload: null | any = null;
    try {
      jwtPayload = jwtwebtoken.verify(jwt, this.JWT_SECRET);
    } catch (err) {
      throw new Error('Invalid JWT!');
    }
    const result = await this.collection.findOne({
      _id: id.toString() as any,
    });

    if (!result) {
      return ok(null);
    }

    if (result.userId !== jwtPayload.sub) {
      throw new Error('Invalid userId');
    }

    const { _id, ...todo } = result as any;
    return ok(
      TodoEntity.fromPrimitives({
        ...todo,
        id: _id.toString(),
      }),
    );
  }

  @Application.Repo.Decorators.ReturnUnexpectedError()
  async update(
    todo: TodoEntity,
  ): Promise<Either<void, Application.Repo.Errors.Unexpected>> {
    const { id, ...todoInfo } = todo.toPrimitives();
    await this.collection.updateOne(
      {
        _id: id as any,
      },
      {
        $set: todoInfo,
      },
    );
    return ok();
  }

  @Application.Repo.Decorators.ReturnUnexpectedError()
  async delete(
    id: Domain.UUIDv4,
  ): Promise<Either<void, Application.Repo.Errors.Unexpected>> {
    throw new Error('Method not implemented.');
  }

  @Application.Repo.Decorators.ReturnUnexpectedError()
  async save(
    todo: TodoEntity,
  ): Promise<Either<void, Application.Repo.Errors.Unexpected>> {
    const { jwt } = asyncLocalStorage.getStore()?.get('context');
    let jwtPayload: null | any = null;
    try {
      jwtPayload = jwtwebtoken.verify(jwt, this.JWT_SECRET);
    } catch (err) {
      throw new Error('Invalid JWT!');
    }
    const createdTodo = todo.toPrimitives();
    if (createdTodo.userId !== jwtPayload.sub) {
      throw new Error('Invalid userId');
    }
    const { id, ...todoInfo } = createdTodo;
    await this.collection.insertOne({
      _id: id as any,
      id: id,
      ...todoInfo,
    });
    this.domainEventBus.publish(todo.domainEvents);
    return ok();
  }
}
