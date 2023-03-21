import { Module, DynamicModule, Inject } from '@nestjs/common';
import { Pool, PoolConfig } from 'pg';
import { PostgresCoreModule } from './postgres-core.module';

export const constants = {
  pg_connection: 'POSTGRES_DB_CONNECTION',
};

@Module({})
export class PostgresModule {
  constructor(@Inject(constants.pg_connection) private pool: Pool) {}
  static forRoot(options: PoolConfig): DynamicModule {
    return {
      module: PostgresModule,
      imports: [PostgresCoreModule.forRoot(options)],
    };
  }

  static forFeature(sqlStatement: string): DynamicModule {
    return PostgresCoreModule.forFeature(sqlStatement);
    // return {
    //   module: PostgresModule,
    // };
  }
}
