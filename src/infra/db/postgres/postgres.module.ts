import { Module, DynamicModule } from '@nestjs/common';
import { Pool, PoolConfig } from 'pg';

export const constants = {
  pg_connection: 'POSTGRES_DB_CONNECTION',
};

@Module({})
export class PostgresModule {
  static forRoot(options: PoolConfig): DynamicModule {
    const poolProvider = {
      provide: constants.pg_connection,
      useValue: new Pool(options),
    };
    return {
      module: PostgresModule,
      providers: [poolProvider],
      exports: [poolProvider],
    };
  }
}
