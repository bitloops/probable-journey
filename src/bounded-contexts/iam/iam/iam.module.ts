import { Module } from '@nestjs/common';

import { IamModule as LibIamModule } from 'src/lib/bounded-contexts/iam/authentication/iam.module';
import { MongoModule } from '@src/infra/db/mongo/mongo.module';
import { PostgresModule } from '@src/infra/db/postgres/postgres.module';
import { UserWriteRepoPortToken } from '@src/lib/bounded-contexts/iam/authentication/ports/UserWriteRepoPort';
import { UserWriteRepository } from './repository/user-write.repository';
import { PubSubCommandHandlers } from '@src/lib/bounded-contexts/iam/authentication/application/command-handlers';
import { NatsStreamingIntegrationEventBus } from '@src/bitloops/nest-jetstream/buses/nats-streaming-integration-event-bus';
import { BUSES_TOKENS, JetstreamModule } from '@src/bitloops/nest-jetstream';
import { StreamingDomainEventHandlers } from '@src/lib/bounded-contexts/iam/authentication/application/event-handlers';

const RepoProviders = [
  {
    provide: UserWriteRepoPortToken,
    useClass: UserWriteRepository,
  },
  {
    provide: BUSES_TOKENS.STREAMING_INTEGRATION_EVENT_BUS,
    useClass: NatsStreamingIntegrationEventBus,
  },
];
@Module({
  imports: [
    LibIamModule.register({
      inject: [...RepoProviders],
      imports: [
        MongoModule,
        PostgresModule.forRoot({
          database: process.env.PG_IAM_DATABASE ?? 'iam',
          host: process.env.PG_IAM_HOST ?? 'localhost',
          port: process.env.PG_IAM_PORT ? +process.env.PG_IAM_PORT : 5432,
          // user && password
          max: 20,
        }),
      ],
    }),
    JetstreamModule.forFeature({
      moduleOfHandlers: IamModule,
      pubSubCommandHandlers: [...PubSubCommandHandlers],
      streamingDomainEventHandlers: [...StreamingDomainEventHandlers],
    }),
  ],
  controllers: [],
  exports: [LibIamModule],
})
export class IamModule {}
