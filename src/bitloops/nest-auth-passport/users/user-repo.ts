import { Application, Either, ok, fail } from '@bitloops/bl-boilerplate-core';
import { Injectable, Inject } from '@nestjs/common';
import {
  Collection,
  MongoClient,
  TransactionOptions,
  ClientSession,
} from 'mongodb';
import { UserRepoPort } from './user-repo.port';

const MONGO_DB_DATABASE = process.env.MONGO_DB_DATABASE || 'iam';
const MONGO_DB_TODO_COLLECTION =
  process.env.MONGO_DB_TODO_COLLECTION || 'users';

@Injectable()
export class UserRepository implements UserRepoPort {
  private collectionName = MONGO_DB_TODO_COLLECTION;
  private dbName = MONGO_DB_DATABASE;
  private collection: Collection;
  constructor(@Inject('MONGO_DB_CONNECTION') private client: MongoClient) {
    this.collection = this.client
      .db(this.dbName)
      .collection(this.collectionName);
  }

  async getByEmail(
    email: string,
    session?: ClientSession,
  ): Promise<User | null> {
    const result = await this.collection.findOne(
      {
        email: email,
      },
      {
        session,
      },
    );

    if (!result) {
      return null;
    }

    const { _id, ...user } = result as any;
    return {
      ...user,
      id: _id.toString(),
    };
  }

  private async save(user: User, session?: ClientSession): Promise<void> {
    await this.collection.insertOne(
      {
        _id: user.id as any,
        ...user,
      },
      {
        session,
      },
    );
  }

  async checkDoesNotExistAndCreate(
    user: User,
  ): Promise<Either<void, Application.Repo.Errors.Conflict>> {
    const session = this.client.startSession();
    try {
      // Lock write
      const transactionOptions: TransactionOptions = {
        readConcern: { level: 'snapshot' },
        writeConcern: { w: 'majority' },
      };
      session.startTransaction(transactionOptions);

      const alreadyExistedUser = await this.getByEmail(user.email, session);
      if (alreadyExistedUser)
        return fail(new Application.Repo.Errors.Conflict(user.email));

      await this.save(user, session);

      await session.commitTransaction();
    } catch (e) {
      console.log(e);
      await session.abortTransaction();
      //throw
    } finally {
      session.endSession();
    }

    return ok();
  }
}
