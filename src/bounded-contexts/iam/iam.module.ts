import { Module } from '@nestjs/common';

import { IamModule as LibIamModule } from 'src/lib/bounded-contexts/iam/authentication/iam.module';
import { MongoModule } from '@src/infra/db/mongo/mongo.module';
import { UserWriteRepoPortToken } from '@src/lib/bounded-contexts/iam/authentication/ports/UserWriteRepoPort';
import { UserWriteRepository } from './repository/user-write.repository';

const RepoProviders = [
  {
    provide: UserWriteRepoPortToken,
    useClass: UserWriteRepository,
  },
];
@Module({
  imports: [
    LibIamModule.register({
      inject: [...RepoProviders],
      imports: [
        MongoModule
      ],
    }),
  ],
  controllers: [],
  exports: [LibIamModule],
})
export class IamModule { }
