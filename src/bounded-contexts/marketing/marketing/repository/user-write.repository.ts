import { Domain } from '@bitloops/bl-boilerplate-core';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schema/user.schema';
import { UserEntity } from '@src/lib/bounded-contexts/marketing/marketing/domain/UserEntity';
import { UserWriteRepoPort } from '@src/lib/bounded-contexts/marketing/marketing/ports/UserWriteRepoPort';

@Injectable()
export class UserWriteRepository implements UserWriteRepoPort {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    update(aggregate: UserEntity): Promise<void> {
        throw new Error('Method not implemented.');
    }
    delete(aggregateRootId: Domain.UUIDv4): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async getById(id: Domain.UUIDv4): Promise<UserEntity> {
        const user = await this.userModel.findById(id.toString()) as UserEntity;
        return user;
    }

    async save(user: UserEntity): Promise<void> {
        const createdUser = new this.userModel(user.toPrimitives());
        // this.publish(todo.events)
        await createdUser.save();
    }
}
