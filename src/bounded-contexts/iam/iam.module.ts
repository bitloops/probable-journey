import { Module } from '@nestjs/common';

import { IamModule as LibIamModule } from 'src/lib/bounded-contexts/iam/authentication/iam.module';
import { MongoModule } from '@src/infra/db/mongo/mongo.module';
import { UserWriteRepoPortToken } from '@src/lib/bounded-contexts/iam/authentication/ports/UserWriteRepoPort';
import { UserWriteRepository } from './repository/user-write.repository';
import { NatsStreamingIntegrationEventBus } from '@src/infra/jetstream/buses/nats-streaming-integration-event-bus';
import { StreamingIntegrationEventBusToken } from '@src/lib/bounded-contexts/iam/authentication/constants';
import { JetstreamModule } from '@src/infra/jetstream/jetstream.module';
import { PubSubCommandHandlers } from '@src/lib/bounded-contexts/iam/authentication/application/command-handlers';

const RepoProviders = [
  {
    provide: UserWriteRepoPortToken,
    useClass: UserWriteRepository,
  },
  {
    provide: StreamingIntegrationEventBusToken,
    useClass: NatsStreamingIntegrationEventBus,
  },
];
@Module({
  imports: [
    LibIamModule.register({
      inject: [...RepoProviders],
      imports: [MongoModule],
    }),
    JetstreamModule.forFeature({
      moduleOfHandlers: IamModule,
      pubSubCommandHandlers: [...PubSubCommandHandlers],
    }),
  ],
  controllers: [],
  exports: [LibIamModule],
})
export class IamModule {}
