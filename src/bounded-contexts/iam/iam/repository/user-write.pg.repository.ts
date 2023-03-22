import {
  Application,
  Domain,
  Either,
  Infra,
  ok,
  fail,
} from '@bitloops/bl-boilerplate-core';
import { Injectable, Inject } from '@nestjs/common';
import * as jwtwebtoken from 'jsonwebtoken';
import { UserWriteRepoPort } from '@src/lib/bounded-contexts/iam/authentication/ports/UserWriteRepoPort';
import { UserEntity } from '@src/lib/bounded-contexts/iam/authentication/domain/UserEntity';
import { BUSES_TOKENS } from '@src/bitloops/nest-jetstream/buses';
import { constants } from '@src/infra/db/postgres/postgres.module';
import { EmailVO } from '@src/lib/bounded-contexts/iam/authentication/domain/EmailVO';
import { ConfigService } from '@nestjs/config';
import { AuthEnvironmentVariables } from '@src/config/auth.configuration';

@Injectable()
export class UserWritePostgresRepository implements UserWriteRepoPort {
  private readonly tableName = 'users';
  private readonly JWT_SECRET: string;
  constructor(
    @Inject(constants.pg_connection) private readonly connection: any,
    @Inject(BUSES_TOKENS.STREAMING_DOMAIN_EVENT_BUS)
    private readonly domainEventBus: Infra.EventBus.IEventBus,
    private configService: ConfigService<AuthEnvironmentVariables, true>,
  ) {
    this.JWT_SECRET = this.configService.get('jwtSecret', { infer: true });
  }

  async update(aggregate: UserEntity): Promise<void> {
    const userPrimitives = aggregate.toPrimitives();
    const { id, email, password, lastLogin } = userPrimitives;
    const sqlStatement = `UPDATE ${this.tableName}
    SET email = $2, password = $3, last_login = $4
    WHERE id = $1`;
    await this.connection.query(sqlStatement, [id, email, password, lastLogin]);
    this.domainEventBus.publish(aggregate.domainEvents);
  }

  async delete(aggregateRootId: Domain.UUIDv4): Promise<void> {
    // We probably need also aggregate here in order to dispatch Events
    const sqlStatement = `DELETE FROM ${this.tableName} WHERE id = $1`;
    await this.connection.query(sqlStatement, [aggregateRootId.toString()]);
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
    const result = await this.connection.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id.toString()],
    );

    if (!result.rows.length) {
      return null;
    }

    const userPrimitives = result.rows[0];
    if (userPrimitives.id !== jwtPayload.sub) {
      throw new Error('Invalid userId');
    }
    const { last_login, ...user } = userPrimitives;

    return UserEntity.fromPrimitives({
      ...user,
      lastLogin: new Date(last_login),
    });
  }

  async getByEmail(email: EmailVO): Promise<UserEntity | null> {
    const result = await this.connection.query(
      `SELECT * FROM ${this.tableName} WHERE email = $1`,
      [email.email],
    );

    if (!result.rows.length) {
      return null;
    }

    const userPrimitives = result.rows[0];
    const { last_login, ...user } = userPrimitives;

    return UserEntity.fromPrimitives({
      ...user,
      lastLogin: new Date(last_login),
    });
  }

  async save(user: UserEntity): Promise<void> {
    const sqlStatement = `INSERT INTO ${this.tableName} (id, email, password, last_login) VALUES ($1, $2, $3, $4);`;
    const userPrimitives = user.toPrimitives();
    const { id, email, password, lastLogin } = userPrimitives;
    await this.connection.query(sqlStatement, [id, email, password, lastLogin]);
    this.domainEventBus.publish(user.domainEvents);
  }

  async checkDoesNotExistAndCreate(
    user: UserEntity,
  ): Promise<Either<void, Application.Repo.Errors.Conflict>> {
    // note: we don't try/catch this because if connecting throws an exception
    // we don't need to dispose of the client (it will be undefined)
    const client = await this.connection.connect();

    try {
      await client.query('BEGIN');

      const userExistsQuery = `SELECT * FROM ${this.tableName} WHERE email = $1`;
      const res = await client.query(userExistsQuery, [user.email.email]);
      if (res.rows.length > 0) {
        throw new Error('User already exists');
      }

      const insertUserText = `INSERT INTO ${this.tableName} (id, email, password, last_login) VALUES ($1, $2, $3, $4);`;

      const { id, email, password, lastLogin } = user.toPrimitives();
      const insertUserValues = [id, email, password, lastLogin];
      await this.connection.query(insertUserText, insertUserValues);
      await client.query('COMMIT');
      return ok();
    } catch (e) {
      await client.query('ROLLBACK');
      console.log('Error in transaction', e);
      return fail(new Application.Repo.Errors.Conflict(user.email.email));
    } finally {
      client.release();
    }
  }
}
