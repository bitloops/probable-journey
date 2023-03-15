import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MarketingModule as LibMarketingModule } from 'src/lib/bounded-contexts/marketing/marketing/marketing.module';
import { UserWriteRepository } from './repository/user-write.repository';
import { UserWriteRepoPortToken } from '@src/lib/bounded-contexts/marketing/marketing/ports/UserWriteRepoPort';
import { UserEmailReadRepoPortToken } from '@src/lib/bounded-contexts/marketing/marketing/ports/UserEmailReadRepoPort';
import { UserEmailReadRepository } from './repository/user-email-read.repository';
import { User, UserSchema } from './repository/schema/user.schema';
import { EmailSchema, UserEmail } from './repository/schema/email.schema';

const RepoProviders = [
  {
    provide: UserWriteRepoPortToken,
    useClass: UserWriteRepository,
  },
  {
    provide: UserEmailReadRepoPortToken,
    useClass: UserEmailReadRepository,
  },
];
@Module({
  imports: [
    // MongooseModule.forFeature([{ name: Todo.name, schema: TodoSchema }]),
    LibMarketingModule.register({
      inject: [...RepoProviders],
      imports: [
        MongooseModule.forFeature([{ name: UserEmail.name, schema: EmailSchema }]),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      ],
    }),
  ],
  controllers: [],
  // Probably don't need to inject the repositories here
  //   providers: [...RepoProviders],
  exports: [LibMarketingModule],
})
export class TodoModule { }
