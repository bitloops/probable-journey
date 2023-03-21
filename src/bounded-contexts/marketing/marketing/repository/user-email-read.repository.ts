import { Domain } from '@bitloops/bl-boilerplate-core';
import { Injectable, Inject } from '@nestjs/common';
import { Collection, MongoClient } from 'mongodb';
import * as jwtwebtoken from 'jsonwebtoken';
import { UserEmailReadRepoPort } from '@src/lib/bounded-contexts/marketing/marketing/ports/user-email-read.repo-port';
import { UserReadModel } from '@src/lib/bounded-contexts/marketing/marketing/domain/read-models/user-email.read-model';

const JWT_SECRET = 'p2s5v8x/A?D(G+KbPeShVmYq3t6w9z$B';
const MONGO_DB_DATABASE = process.env.MONGO_DB_DATABASE || 'marketing';
const MONGO_DB_TODO_COLLECTION =
  process.env.MONGO_DB_TODO_COLLECTION || 'userEmail';

@Injectable()
export class UserEmailReadRepository implements UserEmailReadRepoPort {
  private collectionName = MONGO_DB_TODO_COLLECTION;
  private dbName = MONGO_DB_DATABASE;
  private collection: Collection;
  constructor(@Inject('MONGO_DB_CONNECTION') private client: MongoClient) {
    this.collection = this.client
      .db(this.dbName)
      .collection(this.collectionName);
  }

  async getUserEmail(
    userid: Domain.UUIDv4,
    ctx?: any,
  ): Promise<UserReadModel | null> {
    const { jwt } = ctx;
    let jwtPayload: null | any = null;
    try {
      jwtPayload = jwtwebtoken.verify(jwt, JWT_SECRET);
    } catch (err) {
      throw new Error('Invalid JWT!');
    }
    const result = await this.collection.findOne({
      _id: userid.toString() as any,
    });

    if (!result) {
      return null;
    }

    if (result.userId !== jwtPayload.userId) {
      throw new Error('Invalid userId');
    }

    const { _id, ...todo } = result as any;
    return UserReadModel.fromPrimitives({
      ...todo,
      id: _id.toString(),
    });
  }

  async getById(id: string): Promise<UserReadModel | null> {
    throw new Error('Method not implemented.');
  }

  async getAll(): Promise<UserReadModel[]> {
    throw new Error('Method not implemented.');
  }

  async save(userEmailReadModel: UserReadModel, ctx?: any): Promise<void> {
    const { jwt } = ctx;
    let jwtPayload: null | any = null;
    try {
      jwtPayload = jwtwebtoken.verify(jwt, JWT_SECRET);
    } catch (err) {
      throw new Error('Invalid JWT!');
    }
    const userEmail = userEmailReadModel.toPrimitives();
    if (userEmail.userId !== jwtPayload.userId) {
      throw new Error('Invalid userId');
    }
    await this.collection.insertOne({
      _id: userEmail.userId as any,
      ...userEmail,
    });
  }

  async create(userReadModel: UserReadModel): Promise<void> {
    const userEmail = userReadModel.toPrimitives();
    await this.collection.insertOne({
      _id: userEmail.userId as any,
      ...userEmail,
    });
  }
}
