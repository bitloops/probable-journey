import {
  Application,
  Domain,
  Either,
  Infra,
  ok,
  fail,
} from '@bitloops/bl-boilerplate-core';
import { Injectable, Inject } from '@nestjs/common';
import {
  Collection,
  MongoClient,
  TransactionOptions,
  ClientSession,
} from 'mongodb';
import * as jwtwebtoken from 'jsonwebtoken';
import { UserWriteRepoPort } from '@src/lib/bounded-contexts/iam/authentication/ports/UserWriteRepoPort';
import { UserEntity } from '@src/lib/bounded-contexts/iam/authentication/domain/UserEntity';
import { BUSES_TOKENS } from '@src/bitloops/nest-jetstream/buses';
import { EmailVO } from '@src/lib/bounded-contexts/iam/authentication/domain/EmailVO';
import { ConfigService } from '@nestjs/config';
import { AuthEnvironmentVariables } from '@src/config/auth.configuration';

const MONGO_DB_DATABASE = process.env.MONGO_DB_DATABASE || 'iam';
const MONGO_DB_TODO_COLLECTION =
  process.env.MONGO_DB_TODO_COLLECTION || 'users';

@Injectable()
export class UserWriteRepository implements UserWriteRepoPort {
  private collectionName = MONGO_DB_TODO_COLLECTION;
  private dbName = MONGO_DB_DATABASE;
  private collection: Collection;
  private JWT_SECRET: string;
  constructor(
    @Inject('MONGO_DB_CONNECTION') private client: MongoClient,
    @Inject(BUSES_TOKENS.STREAMING_DOMAIN_EVENT_BUS)
    private readonly domainEventBus: Infra.EventBus.IEventBus,
    private readonly configService: ConfigService<
      AuthEnvironmentVariables,
      true
    >,
  ) {
    this.collection = this.client
      .db(this.dbName)
      .collection(this.collectionName);
    this.JWT_SECRET = this.configService.get('jwtSecret', { infer: true });
  }

  update(aggregate: UserEntity): Promise<void> {
    throw new Error('Method not implemented.');
  }
  delete(aggregateRootId: Domain.UUIDv4): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async getById(
    id: Domain.UUIDv4,
    ctx: Application.TContext,
  ): Promise<UserEntity | null> {
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

    if (result.userId !== jwtPayload.sub) {
      throw new Error('Invalid userId');
    }

    const { _id, ...todo } = result as any;
    return UserEntity.fromPrimitives({
      ...todo,
      id: _id.toString(),
    });
  }

  async getByEmail(
    email: EmailVO,
    session?: ClientSession,
  ): Promise<UserEntity | null> {
    const result = await this.collection.findOne(
      {
        email: email.email,
      },
      {
        session,
      },
    );

    if (!result) {
      return null;
    }

    const { _id, ...user } = result as any;
    return UserEntity.fromPrimitives({
      ...user,
      id: _id.toString(),
    });
  }

  async save(user: UserEntity, session?: ClientSession): Promise<void> {
    const createdUser = user.toPrimitives();
    await this.collection.insertOne(
      {
        _id: createdUser.id as any,
        ...createdUser,
      },
      {
        session,
      },
    );
  }

  async checkDoesNotExistAndCreate(
    user: UserEntity,
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
        return fail(new Application.Repo.Errors.Conflict(user.email.email));

      await this.save(user, session);

      await session.commitTransaction();
    } catch (e) {
      console.log(e);
      await session.abortTransaction();
      //throw
    } finally {
      session.endSession();
    }

    this.domainEventBus.publish(user.domainEvents);
    return ok();
  }
}
