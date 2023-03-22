import { Injectable, Inject } from '@nestjs/common';
import { Collection, MongoClient } from 'mongodb';
import * as jwtwebtoken from 'jsonwebtoken';
import { NotificationTemplateReadRepoPort } from '@src/lib/bounded-contexts/marketing/marketing/ports/notification-template-read.repo-port.';
import { NotificationTemplateReadModel } from '@src/lib/bounded-contexts/marketing/marketing/domain/read-models/notification-template.read-model';
import { AuthEnvironmentVariables } from '@src/config/auth.configuration';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationTemplateReadRepository
  implements NotificationTemplateReadRepoPort
{
  private collectionName =
    process.env.MONGO_DB_TODO_COLLECTION || 'notificationTemplates';
  private dbName = process.env.MONGO_DB_DATABASE || 'marketing';
  private collection: Collection;
  private JWT_SECRET: string;
  constructor(
    @Inject('MONGO_DB_CONNECTION') private client: MongoClient,
    private configService: ConfigService<AuthEnvironmentVariables, true>,
  ) {
    this.collection = this.client
      .db(this.dbName)
      .collection(this.collectionName);
    this.JWT_SECRET = this.configService.get('jwtSecret', { infer: true });
  }

  async getByType(
    type: string,
    ctx?: any,
  ): Promise<NotificationTemplateReadModel | null> {
    const { jwt } = ctx;
    let jwtPayload: null | any = null;
    try {
      jwtPayload = jwtwebtoken.verify(jwt, this.JWT_SECRET);
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
  async getById(
    id: string,
    ctx?: any,
  ): Promise<NotificationTemplateReadModel | null> {
    const { jwt } = ctx;
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
