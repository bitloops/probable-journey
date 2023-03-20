import { Domain, Infra } from '@bitloops/bl-boilerplate-core';
import { Injectable, Inject } from '@nestjs/common';
import * as jwtwebtoken from 'jsonwebtoken';
import { UserWriteRepoPort } from '@src/lib/bounded-contexts/iam/authentication/ports/UserWriteRepoPort';
import { UserEntity } from '@src/lib/bounded-contexts/iam/authentication/domain/UserEntity';
import { TContext } from '@src/lib/bounded-contexts/todo/todo/types';
import { BUSES_TOKENS } from '@src/bitloops/nest-jetstream/buses';
import { constants } from '@src/infra/db/postgres/postgres.module';
import { EmailVO } from '@src/lib/bounded-contexts/iam/authentication/domain/EmailVO';

const JWT_SECRET = 'p2s5v8x/A?D(G+KbPeShVmYq3t6w9z$B';

@Injectable()
export class UserWritePostgresRepository implements UserWriteRepoPort {
  private readonly tableName = 'users';
  constructor(
    @Inject(constants.pg_connection) private readonly connection: any,
    @Inject(BUSES_TOKENS.STREAMING_DOMAIN_EVENT_BUS)
    private readonly domainEventBus: Infra.EventBus.IEventBus,
  ) {}

  async update(aggregate: UserEntity): Promise<void> {
    const userPrimitives = aggregate.toPrimitives();
    const { id, email, password, lastLogin } = userPrimitives;
    const sqlStatement = `UPDATE ${this.tableName}
    SET email = $2, password = $3, lastLogin = $4
    WHERE id = $1`;
    await this.connection.query(sqlStatement, [id, email, password, lastLogin]);
    this.domainEventBus.publish(aggregate.domainEvents);
  }

  async delete(aggregateRootId: Domain.UUIDv4): Promise<void> {
    // We probably need also aggregate here in order to dispatch Events
    const sqlStatement = `DELETE FROM ${this.tableName} WHERE id = $1`;
    await this.connection.query(sqlStatement, [aggregateRootId.toString()]);
  }

  async getById(id: Domain.UUIDv4, ctx: TContext): Promise<UserEntity | null> {
    const { jwt } = ctx;
    let jwtPayload: null | any = null;
    try {
      jwtPayload = jwtwebtoken.verify(jwt, JWT_SECRET);
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

    return UserEntity.fromPrimitives(userPrimitives);
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
    return UserEntity.fromPrimitives(userPrimitives);
  }

  async save(user: UserEntity): Promise<void> {
    const sqlStatement = `INSERT INTO ${this.tableName} (id, email, password, lastLogin) VALUES ($1, $2, $3, $4);`;
    const userPrimitives = user.toPrimitives();
    const { id, email, password, lastLogin } = userPrimitives;
    await this.connection.query(sqlStatement, [id, email, password, lastLogin]);
    this.domainEventBus.publish(user.domainEvents);
  }
}
