import { DynamicModule, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { UsersService } from './users/users.service';
import { UserRepoPortToken } from './users/user-repo.port';
import { JwtAuthModule } from './jwt/jwt.module';
import { UserPostgresRepository } from './users/user-pg-repo';
import {
  PostgresModule,
  PostgresModuleAsyncOptions,
} from '../postgres/postgres.module';
import { JwtModuleAsyncOptions } from '@nestjs/jwt';
import { JWTSecret } from './constants';

@Module({
  imports: [PassportModule],
  providers: [
    AuthService,
    LocalStrategy,
    UsersService,
    { provide: UserRepoPortToken, useClass: UserPostgresRepository },
  ],
  exports: [AuthService],
})
export class AuthModule {
  static forRootAsync({
    jwtOptions,
    postgresOptions,
  }: {
    jwtOptions: JwtModuleAsyncOptions;
    postgresOptions: PostgresModuleAsyncOptions;
  }): DynamicModule {
    const jwtSecretProvider = {
      provide: JWTSecret,
      useFactory: async (...args: any[]) => {
        if (!jwtOptions.useFactory) {
          throw new Error('No useFactory function provided');
        }
        return ((await jwtOptions.useFactory(...args)) as any).secret;
      },
      inject: jwtOptions.inject,
    };

    return {
      module: AuthModule,
      imports: [
        JwtAuthModule.registerAsync(jwtOptions),
        PostgresModule.forRootAsync(postgresOptions),
      ],
      providers: [jwtSecretProvider],
      exports: [jwtSecretProvider],
    };
  }
}
