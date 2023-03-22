import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from './users/users.service';
import { MongoModule } from '@src/infra/db/mongo/mongo.module';
import { UserRepoPortToken } from './users/user-repo.port';
import { UserRepository } from './users/user-repo';

@Module({
  imports: [
    PassportModule,
    MongoModule,
    JwtModule.register({
      secret: 'p2s5v8x/A?D(G+KbPeShVmYq3t6w9z$B',
      signOptions: { expiresIn: '3600s' },
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    UsersService,
    { provide: UserRepoPortToken, useClass: UserRepository },
  ],
  exports: [AuthService],
})
export class AuthModule {}
