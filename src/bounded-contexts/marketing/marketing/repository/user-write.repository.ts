import { Domain } from '@bitloops/bl-boilerplate-core';
import { Injectable, Inject } from '@nestjs/common';
import { Collection, MongoClient } from 'mongodb';
import * as jwtwebtoken from 'jsonwebtoken';
import { UserEntity } from '@src/lib/bounded-contexts/marketing/marketing/domain/user.entity';
import { UserWriteRepoPort } from '@src/lib/bounded-contexts/marketing/marketing/ports/user-write.repo-port';

const JWT_SECRET = 'p2s5v8x/A?D(G+KbPeShVmYq3t6w9z$B';
const MONGO_DB_DATABASE = process.env.MONGO_DB_DATABASE || 'marketing';
const MONGO_DB_TODO_COLLECTION =
    process.env.MONGO_DB_TODO_COLLECTION || 'users';

@Injectable()
export class UserWriteRepository implements UserWriteRepoPort {
    private collectionName = MONGO_DB_TODO_COLLECTION;
    private dbName = MONGO_DB_DATABASE;
    private collection: Collection;
    constructor(@Inject('MONGO_DB_CONNECTION') private client: MongoClient) {
        this.collection = this.client
            .db(this.dbName)
            .collection(this.collectionName);
    }

    update(aggregate: UserEntity): Promise<void> {
        throw new Error('Method not implemented.');
    }
    delete(aggregateRootId: Domain.UUIDv4): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async getById(id: Domain.UUIDv4, ctx?: any): Promise<UserEntity | null> {
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
        return UserEntity.fromPrimitives({
            ...todo,
            id: _id.toString(),
        });
    }

    async save(user: UserEntity, ctx?: any): Promise<void> {
        const { jwt } = ctx;
        let jwtPayload: null | any = null;
        try {
            jwtPayload = jwtwebtoken.verify(jwt, JWT_SECRET);
        } catch (err) {
            throw new Error('Invalid JWT!');
        }
        const createdUser = user.toPrimitives();
        if (createdUser.userId !== jwtPayload.userId) {
            throw new Error('Invalid userId');
        }
        await this.collection.insertOne({
            _id: createdUser.userId as any,
            ...createdUser,
        });
    }
}
