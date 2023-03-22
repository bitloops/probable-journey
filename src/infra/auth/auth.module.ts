import { Module, DynamicModule } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import {
  JwtModule,
  JwtModuleAsyncOptions,
  JwtModuleOptions,
} from '@nestjs/jwt';
import { UsersService } from './users/users.service';
import { ConfigService } from '@nestjs/config';
import { AuthEnvironmentVariables } from '@src/config/auth.configuration';
import { PostgresModule } from '@src/bitloops/postgres';
import { UserRepoPortToken } from '@src/bitloops/nest-auth-passport/users/user-repo.port';
import { UserPostgresRepository } from '@src/bitloops/nest-auth-passport/users/user-pg-repo';
// import { UserRepository } from '@src/bitloops/nest-auth-passport/users/user-repo';

// This can be used from other contexts/modules, that don't need to know about the local strategy(users service)
@Module({})
export class JwtAuthModule {
  static register(options: JwtModuleOptions): DynamicModule {
    return {
      module: JwtAuthModule,
      imports: [JwtModule.register(options)],
      providers: [JwtStrategy],
      exports: [JwtModule],
    };
  }

  static registerAsync(options: JwtModuleAsyncOptions): DynamicModule {
    return {
      module: JwtAuthModule,
      imports: [JwtModule.registerAsync(options)],
      providers: [JwtStrategy],
      exports: [JwtModule],
    };
  }
}

@Module({
  imports: [
    PassportModule,
    JwtAuthModule.registerAsync({
      useFactory: (
        configService: ConfigService<AuthEnvironmentVariables, true>,
      ) => ({
        secret: configService.get('jwtSecret'),
        signOptions: { expiresIn: '3600s' },
      }),
      inject: [ConfigService],
    }),

    PostgresModule.forRootAsync({
      useFactory: (
        configService: ConfigService<AuthEnvironmentVariables, true>,
      ) => ({
        database: configService.get('database.database', { infer: true }),
        host: configService.get('database.host', { infer: true }),
        port: configService.get('database.port', { infer: true }),
        user: configService.get('database.user', { infer: true }),
        password: configService.get('database.password', { infer: true }),
        max: 20,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    UsersService,
    { provide: UserRepoPortToken, useClass: UserPostgresRepository },
  ],
  exports: [AuthService],
})
export class AuthModule {}
