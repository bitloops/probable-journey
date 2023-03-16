import { Injectable, Inject } from '@nestjs/common';
import { Collection, MongoClient } from 'mongodb';
import * as jwtwebtoken from 'jsonwebtoken';
import { NotificationTemplateReadRepoPort } from '@src/lib/bounded-contexts/marketing/marketing/ports/notification-template-read.repo-port.';
import { NotificationTemplateReadModel } from '@src/lib/bounded-contexts/marketing/marketing/domain/read-models/notification-template.read-model';

const JWT_SECRET = 'p2s5v8x/A?D(G+KbPeShVmYq3t6w9z$B';
const MONGO_DB_DATABASE = process.env.MONGO_DB_DATABASE || 'marketing';
const MONGO_DB_TODO_COLLECTION =
    process.env.MONGO_DB_TODO_COLLECTION || 'notificationTemplates';

@Injectable()
export class NotificationTemplateReadRepository implements NotificationTemplateReadRepoPort {
    private collectionName = MONGO_DB_TODO_COLLECTION;
    private dbName = MONGO_DB_DATABASE;
    private collection: Collection;
    constructor(@Inject('MONGO_DB_CONNECTION') private client: MongoClient) {
        this.collection = this.client
            .db(this.dbName)
            .collection(this.collectionName);
    }

    async getByType(type: string, ctx?: any): Promise<NotificationTemplateReadModel | null> {
        const { jwt } = ctx;
        let jwtPayload: null | any = null;
        try {
            jwtPayload = jwtwebtoken.verify(jwt, JWT_SECRET);
        } catch (err) {
            throw new Error('Invalid JWT!');
        }
        const result = await this.collection.findOne({
            type,
        });

        if (!result) {
            return null;
        }

        //TODO check this because there is no userId in the notification template
        // if (result.type !== jwtPayload.userId) {
        //     throw new Error('Invalid type');
        // }

        const { _id, ...todo } = result as any;
        return NotificationTemplateReadModel.fromPrimitives({
            ...todo,
            id: _id.toString(),
        });
    }

    async getAll(): Promise<NotificationTemplateReadModel[] | null> {
        throw new Error('Method not implemented');
    }
    async getById(id: string, ctx?: any): Promise<NotificationTemplateReadModel | null> {
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
        return NotificationTemplateReadModel.fromPrimitives({
            ...todo,
            id: _id.toString(),
        });
    }
}