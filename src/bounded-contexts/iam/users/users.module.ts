import { Module } from '@nestjs/common';
import { MongoModule } from '@src/infra/db/mongo/mongo.module';
import { UserWriteRepoPortToken } from '@src/lib/bounded-contexts/iam/authentication/ports/UserWriteRepoPort';
import { UserWriteRepository } from '../repository/user-write.repository';
import { UsersService } from './users.service';

// TODO check mongo and repo provider if should be in upper level instead
@Module({
  imports: [MongoModule],
  providers: [
    UsersService,
    { provide: UserWriteRepoPortToken, useClass: UserWriteRepository },
  ],
  exports: [UsersService],
})
export class UsersModule {}
