import { Module } from '@nestjs/common';

import { IamModule as LibIamModule } from 'src/lib/bounded-contexts/iam/authentication/iam.module';
import { MongoModule } from '@src/infra/db/mongo/mongo.module';
import { PostgresModule } from '@src/infra/db/postgres/postgres.module';
import { UserWriteRepoPortToken } from '@src/lib/bounded-contexts/iam/authentication/ports/UserWriteRepoPort';
import { UserWriteRepository } from './repository/user-write.repository';
import { StreamingIntegrationEventBusToken } from '@src/lib/bounded-contexts/iam/authentication/constants';
import { PubSubCommandHandlers } from '@src/lib/bounded-contexts/iam/authentication/application/command-handlers';
import { NatsStreamingIntegrationEventBus } from '@src/bitloops/nest-jetstream/buses/nats-streaming-integration-event-bus';
import { JetstreamModule } from '@src/bitloops/nest-jetstream';

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
      imports: [
        MongoModule,
        PostgresModule.forFeature(
          // `DROP TABLE IF EXISTS users;`,
          `CREATE TABLE IF NOT EXISTS users (
            "id" SERIAL,
            "email" VARCHAR(100) NOT NULL,
            "password" VARCHAR(100) NOT NULL,
            "lastLogin" TIMESTAMP,
            PRIMARY KEY ("id")
          );`,
        ),
      ],
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
