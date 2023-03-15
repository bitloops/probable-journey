import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Todo, TodoDocument } from './schema/todo.schema';
import { TodoReadRepoPort } from 'src/lib/bounded-contexts/todo/todo/ports/TodoReadRepoPort';
import { TodoReadModel } from 'src/lib/bounded-contexts/todo/todo/domain/TodoReadModel';

@Injectable()
export class TodoReadRepository implements TodoReadRepoPort {
  constructor(@InjectModel(Todo.name) private todoModel: Model<TodoDocument>) {}

  async getById(id: string): Promise<TodoReadModel | null> {
    throw new Error('Method not implemented.');
  }

  async getAll(): Promise<TodoReadModel[]> {
    const todos = await this.todoModel.find().exec();
    return todos.map((todoObj) => {
      console.log(todoObj);
      const todo = (todoObj as any)._doc;
      const res = TodoReadModel.fromPrimitives({
        ...todo,
        id: todoObj._id.toString(),
      });
      return res;
    });
  }
}
