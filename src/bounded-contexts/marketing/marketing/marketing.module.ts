import { Module } from '@nestjs/common';

import { MarketingModule as LibMarketingModule } from 'src/lib/bounded-contexts/marketing/marketing/marketing.module';
import { UserWriteRepository } from './repository/user-write.repository';
import { UserWriteRepoPortToken } from '@src/lib/bounded-contexts/marketing/marketing/ports/user-write.repo-port';
import { UserEmailReadRepoPortToken } from '@src/lib/bounded-contexts/marketing/marketing/ports/user-email-read.repo-port';
import { UserEmailReadRepository } from './repository/user-email-read.repository';
import { NotificationTemplateReadRepoPortToken } from '@src/lib/bounded-contexts/marketing/marketing/ports/notification-template-read.repo-port.';
import { NotificationTemplateReadRepository } from './repository/notification-template.repository';
import { EmailServicePortToken } from '@src/lib/bounded-contexts/marketing/marketing/constants';
import { MockEmailService } from './service';
import { MongoModule } from '@src/infra/db/mongo/mongo.module';
import { JetstreamModule } from '@src/bitloops/nest-jetstream/jetstream.module';
import { StreamingIntegrationEventHandlers } from '@src/lib/bounded-contexts/marketing/marketing/application/event-handlers';

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
    LibMarketingModule.register({
      inject: [...RepoProviders],
      imports: [MongoModule],
    }),
    JetstreamModule.forFeature({
      moduleOfHandlers: MarketingModule,
      streamingIntegrationEventHandlers: [...StreamingIntegrationEventHandlers],
    }),
  ],
  controllers: [],
  exports: [LibMarketingModule],
})
export class MarketingModule {}
