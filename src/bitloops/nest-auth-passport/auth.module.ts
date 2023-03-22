import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { UsersService } from './users/users.service';
import { UserRepoPortToken } from './users/user-repo.port';
import { JwtAuthModule } from './jwt/jwt.module';
import { AuthEnvironmentVariables } from './auth.configuration';
import { UserPostgresRepository } from './users/user-pg-repo';
import { PostgresModule } from '../postgres/postgres.module';

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
