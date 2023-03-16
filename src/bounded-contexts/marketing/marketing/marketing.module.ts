import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MarketingModule as LibMarketingModule } from 'src/lib/bounded-contexts/marketing/marketing/marketing.module';
import { UserWriteRepository } from './repository/user-write.repository';
import { UserWriteRepoPortToken } from '@src/lib/bounded-contexts/marketing/marketing/ports/user-write.repo-port';
import { UserEmailReadRepoPortToken } from '@src/lib/bounded-contexts/marketing/marketing/ports/user-email-read.repo-port';
import { UserEmailReadRepository } from './repository/user-email-read.repository';
import { User, UserSchema } from './repository/schema/user.schema';
import { EmailSchema, UserEmail } from './repository/schema/email.schema';
import { NotificationTemplateReadRepoPortToken } from '@src/lib/bounded-contexts/marketing/marketing/ports/notification-template-read.repo-port.';
import { NotificationTemplateReadRepository } from './repository/notification-template.repository';
import { EmailServicePortToken } from '@src/lib/bounded-contexts/marketing/marketing/constants';
import { MockEmailService } from './service';
const RepoProviders = [
  {
    provide: UserWriteRepoPortToken,
    useClass: UserWriteRepository,
  },
  {
    provide: UserEmailReadRepoPortToken,
    useClass: UserEmailReadRepository,
  },
  {
    provide: NotificationTemplateReadRepoPortToken,
    useClass: NotificationTemplateReadRepository,
  },
  {
    provide: EmailServicePortToken,
    useClass: MockEmailService,
  },
];
@Module({
  imports: [
    // MongooseModule.forFeature([{ name: Todo.name, schema: TodoSchema }]),
    LibMarketingModule.register({
      inject: [...RepoProviders],
      imports: [
        MongooseModule.forFeature([
          { name: UserEmail.name, schema: EmailSchema },
        ]),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        //schema for notificationTemplate
      ],
    }),
  ],
  controllers: [],
  // Probably don't need to inject the repositories here
  //   providers: [...RepoProviders],
  exports: [LibMarketingModule],
})
export class MarketingModule {}
