import { Domain } from '@bitloops/bl-boilerplate-core';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserEmail, UserEmailDocument } from './schema/email.schema';
import { UserEmailReadRepoPort } from '@src/lib/bounded-contexts/marketing/marketing/ports/UserEmailReadRepoPort';
import { UserEmailReadModel } from '@src/lib/bounded-contexts/marketing/marketing/domain/read-models/userEmailReadModel';


@Injectable()
export class UserEmailReadRepository implements UserEmailReadRepoPort {
    constructor(@InjectModel(UserEmail.name) private userEmailModel: Model<UserEmailDocument>) { }

    async getUserEmail(userid: Domain.UUIDv4): Promise<string> {
        const userEmail = await this.userEmailModel.findOne({ _id: userid.toString() }).exec() as unknown as UserEmail;
        return userEmail.email;
    }

    async getById(id: string): Promise<UserEmailReadModel | null> {
        throw new Error('Method not implemented.');
    }

    async getAll(): Promise<UserEmailReadModel[]> {
        throw new Error('Method not implemented.');
        // const todos = await this.todoModel.find().exec();
        // return todos.map((todoObj) => {
        //     console.log(todoObj);
        //     const todo = (todoObj as any)._doc;
        //     const res = TodoReadModel.fromPrimitives({
        //         ...todo,
        //         id: todoObj._id.toString(),
        //     });
        //     return res;
        // });
    }
}
