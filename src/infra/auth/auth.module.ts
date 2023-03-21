import { Module, DynamicModule } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { UsersService } from './users/users.service';
import { UserWriteRepoPortToken } from '@src/lib/bounded-contexts/iam/authentication/ports/UserWriteRepoPort';
import { MongoModule } from '@src/infra/db/mongo/mongo.module';
import { UserWriteRepository } from '@src/bounded-contexts/iam/iam/repository/user-write.repository';

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
}

@Module({
  imports: [
    PassportModule,
    MongoModule,
    JwtAuthModule.register({
      secret: 'p2s5v8x/A?D(G+KbPeShVmYq3t6w9z$B',
      signOptions: { expiresIn: '3600s' },
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    UsersService,
    { provide: UserWriteRepoPortToken, useClass: UserWriteRepository },
  ],
  exports: [AuthService],
})
export class AuthModule {}
