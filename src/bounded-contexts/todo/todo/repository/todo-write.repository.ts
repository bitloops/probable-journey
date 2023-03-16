import { Domain } from '@bitloops/bl-boilerplate-core';
import { Injectable, Inject } from '@nestjs/common';
import { Collection, MongoClient } from 'mongodb';
import * as jwtwebtoken from 'jsonwebtoken';
import { TodoWriteRepoPort } from 'src/lib/bounded-contexts/todo/todo/ports/TodoWriteRepoPort';
import { TodoEntity } from 'src/lib/bounded-contexts/todo/todo/domain/TodoEntity';
import {
  StreamingDomainEventBus,
  StreamingDomainEventBusToken,
} from '@src/infra/jetstream/buses/nats-streaming-domain-event-bus';

const JWT_SECRET = 'p2s5v8x/A?D(G+KbPeShVmYq3t6w9z$B';

const MONGO_DB_DATABASE = process.env.MONGO_DB_DATABASE || 'todo';
const MONGO_DB_TODO_COLLECTION =
  process.env.MONGO_DB_TODO_COLLECTION || 'todos';

@Injectable()
export class TodoWriteRepository implements TodoWriteRepoPort {
  private collectionName = MONGO_DB_TODO_COLLECTION;
  private dbName = MONGO_DB_DATABASE;
  private collection: Collection;

  constructor(
    @Inject('MONGO_DB_CONNECTION') private client: MongoClient,
    @Inject(StreamingDomainEventBusToken)
    private readonly domainEventBus: StreamingDomainEventBus,
  ) {
    this.collection = this.client
      .db(this.dbName)
      .collection(this.collectionName);
  }

  async getById(id: Domain.UUIDv4, ctx?: any): Promise<TodoEntity | null> {
    const { jwt } = ctx;
    let jwtPayload: null | any = null;
    try {
      jwtPayload = jwtwebtoken.verify(jwt, JWT_SECRET);
    } catch (err) {
      throw new Error('Invalid JWT!');
    }
    const result = await this.collection.findOne({
      _id: id.toString() as any,
    });

    if (!result) {
      return null;
    }

    if (result.userId !== jwtPayload.userId) {
      throw new Error('Invalid userId');
    }

    const { _id, ...todo } = result as any;
    return TodoEntity.fromPrimitives({
      ...todo,
      id: _id.toString(),
    });
  }

  async update(todo: TodoEntity, ctx?: any): Promise<void> {
    const { id, ...todoInfo } = todo.toPrimitives();
    await this.collection.updateOne(
      {
        _id: id as any,
      },
      {
        $set: todoInfo,
      },
    );
  }

  async delete(id: Domain.UUIDv4, ctx?: any): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async save(todo: TodoEntity, ctx?: any): Promise<void> {
    const { jwt } = ctx;
    let jwtPayload: null | any = null;
    try {
      jwtPayload = jwtwebtoken.verify(jwt, JWT_SECRET);
    } catch (err) {
      throw new Error('Invalid JWT!');
    }
    const createdTodo = todo.toPrimitives();
    if (createdTodo.userId !== jwtPayload.userId) {
      throw new Error('Invalid userId');
    }
    const { id, ...todoInfo } = createdTodo;
    console.log('id', id);
    await this.collection.insertOne({
      _id: id as any,
      id: id,
      ...todoInfo,
    });
    this.domainEventBus.publish(todo.domainEvents);
  }
}
