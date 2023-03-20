import { Domain, Infra } from '@bitloops/bl-boilerplate-core';
import { Injectable, Inject } from '@nestjs/common';
import { Collection, MongoClient } from 'mongodb';
import * as jwtwebtoken from 'jsonwebtoken';
import { UserWriteRepoPort } from '@src/lib/bounded-contexts/iam/authentication/ports/UserWriteRepoPort';
import { UserEntity } from '@src/lib/bounded-contexts/iam/authentication/domain/UserEntity';
import { TContext } from '@src/lib/bounded-contexts/todo/todo/types';
import { BUSES_TOKENS } from '@src/bitloops/nest-jetstream/buses';

const JWT_SECRET = 'p2s5v8x/A?D(G+KbPeShVmYq3t6w9z$B';
const MONGO_DB_DATABASE = process.env.MONGO_DB_DATABASE || 'iam';
const MONGO_DB_TODO_COLLECTION =
  process.env.MONGO_DB_TODO_COLLECTION || 'users';

@Injectable()
export class UserWriteRepository implements UserWriteRepoPort {
  private collectionName = MONGO_DB_TODO_COLLECTION;
  private dbName = MONGO_DB_DATABASE;
  private collection: Collection;
  constructor(
    @Inject('MONGO_DB_CONNECTION') private client: MongoClient,
    @Inject(BUSES_TOKENS.STREAMING_DOMAIN_EVENT_BUS)
    private readonly domainEventBus: Infra.EventBus.IEventBus,
  ) {
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

  async getById(id: Domain.UUIDv4, ctx: TContext): Promise<UserEntity | null> {
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

    if (result.userId !== jwtPayload.sub) {
      throw new Error('Invalid userId');
    }

    const { _id, ...todo } = result as any;
    return UserEntity.fromPrimitives({
      ...todo,
      id: _id.toString(),
    });
  }

  async getByEmail(email: string): Promise<UserEntity | null> {
    const result = await this.collection.findOne({
      email,
    });

    if (!result) {
      return null;
    }

    const { _id, ...user } = result as any;
    return UserEntity.fromPrimitives({
      ...user,
      id: _id.toString(),
    });
  }

  async save(user: UserEntity): Promise<void> {
    const createdUser = user.toPrimitives();
    await this.collection.insertOne({
      _id: createdUser.id as any,
      ...createdUser,
    });
    this.domainEventBus.publish(user.domainEvents);
  }
}
