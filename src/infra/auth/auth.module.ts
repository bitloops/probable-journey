import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { UsersService } from './users/users.service';
import { UserWriteRepoPortToken } from '@src/lib/bounded-contexts/iam/authentication/ports/UserWriteRepoPort';
import { UserWriteRepository } from '@src/bounded-contexts/marketing/marketing/repository/user-write.repository';
import { MongoModule } from '@src/infra/db/mongo/mongo.module';

@Module({
  imports: [
    PassportModule,
    MongoModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '3600s' },
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    UsersService,
    { provide: UserWriteRepoPortToken, useClass: UserWriteRepository },
  ],
  exports: [AuthService],
})
export class AuthModule {}
