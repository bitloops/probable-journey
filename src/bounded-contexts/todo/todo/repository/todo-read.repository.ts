// import { Model } from 'mongoose';
import { Inject, Injectable } from '@nestjs/common';
import { Collection, MongoClient } from 'mongodb';
import * as jwtwebtoken from 'jsonwebtoken';
// import { InjectModel } from '@nestjs/mongoose';
// import { Todo, TodoDocument } from './schema/todo.schema';
import { TodoReadRepoPort } from 'src/lib/bounded-contexts/todo/todo/ports/TodoReadRepoPort';
import {
  TodoReadModel,
  TTodoReadModelSnapshot,
} from 'src/lib/bounded-contexts/todo/todo/domain/TodoReadModel';

const JWT_SECRET = 'p2s5v8x/A?D(G+KbPeShVmYq3t6w9z$B';

const MONGO_DB_DATABASE = process.env.MONGO_DB_DATABASE || 'todo';
const MONGO_DB_TODO_COLLECTION =
  process.env.MONGO_DB_TODO_COLLECTION || 'todos';

@Injectable()
export class TodoReadRepository implements TodoReadRepoPort {
  private collectionName = MONGO_DB_TODO_COLLECTION;
  private dbName = MONGO_DB_DATABASE;
  private collection: Collection;

  constructor(@Inject('MONGO_DB_CONNECTION') private client: MongoClient) {
    this.collection = this.client
      .db(this.dbName)
      .collection(this.collectionName);
  }

  async getById(id: string): Promise<TodoReadModel | null> {
    throw new Error('Method not implemented.');
  }

  async getAll(ctx: any): Promise<TTodoReadModelSnapshot[]> {
    const { jwt } = ctx;
    let jwtPayload: null | any = null;
    try {
      jwtPayload = jwtwebtoken.verify(jwt, JWT_SECRET);
    } catch (err) {
      throw new Error('Invalid JWT!');
    }
    const userId = jwtPayload.userId;
    if (!userId) {
      throw new Error('Invalid userId');
    }
    const todos = await this.collection.find({ userId: userId }).toArray();
    return todos.map((todo) => {
      const res = {
        id: todo._id.toString(),
        userId: todo.userId,
        title: todo.title,
        completed: todo.completed,
      };
      return res;
    });
  }
}
