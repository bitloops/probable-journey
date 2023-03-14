import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Todo, TodoDocument } from './schema/todo.schema';
import { TodoReadRepoPort } from '../ports/TodoReadRepoPort';
import { TodoReadModel } from '../domain/TodoReadModel';

@Injectable()
export class TodoReadRepository implements TodoReadRepoPort {
  constructor(@InjectModel(Todo.name) private todoModel: Model<TodoDocument>) {}

  async getById(id: string): Promise<TodoReadModel | null> {
    throw new Error('Method not implemented.');
  }

  async getAll(): Promise<TodoReadModel[]> {
    const todos = await this.todoModel.find().exec();
    return todos.map((todo) => {
      const res = TodoReadModel.fromPrimitives({
        ...todo,
        id: todo._id.toString(),
      });
      return res;
    });
  }
}
