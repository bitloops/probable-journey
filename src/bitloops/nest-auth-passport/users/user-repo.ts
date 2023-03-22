import { Application, Either, ok, fail } from '@bitloops/bl-boilerplate-core';
import { Injectable, Inject } from '@nestjs/common';
import { constants } from '@bitloops/postgres';
import { UserRepoPort } from './user-repo.port';

@Injectable()
export class UserPostgresRepository implements UserRepoPort {
  private readonly tableName = 'users';
  constructor(
    @Inject(constants.pg_connection) private readonly connection: any,
  ) {}

  async getByEmail(email: string): Promise<User | null> {
    const result = await this.connection.query(
      `SELECT * FROM ${this.tableName} WHERE email = $1`,
      [email],
    );

    if (!result.rows.length) {
      return null;
    }

    const user = result.rows[0];

    return user;
  }

  async checkDoesNotExistAndCreate(
    user: User,
  ): Promise<Either<void, Application.Repo.Errors.Conflict>> {
    // note: we don't try/catch this because if connecting throws an exception
    // we don't need to dispose of the client (it will be undefined)
    const client = await this.connection.connect();

    try {
      await client.query('BEGIN');

      const userExistsQuery = `SELECT * FROM ${this.tableName} WHERE email = $1`;
      const res = await client.query(userExistsQuery, [user.email]);
      if (res.rows.length > 0) {
        throw new Error('User already exists');
      }

      const insertUserText = `INSERT INTO ${this.tableName} (id, email, password) VALUES ($1, $2, $3);`;

      const { id, email, password } = user;
      const insertUserValues = [id, email, password];
      await this.connection.query(insertUserText, insertUserValues);
      await client.query('COMMIT');
      return ok();
    } catch (e) {
      await client.query('ROLLBACK');
      console.log('Error in transaction', e);
      return fail(new Application.Repo.Errors.Conflict(user.email));
    } finally {
      client.release();
    }
  }
}
