import { DynamicModule, Global, Module } from '@nestjs/common';
import { Jetstream } from './jetstream.service';
import { NestjsJetstream } from './nestjs-jetstream.class';
import { CqrsModule } from '@nestjs/cqrs';
import { ProvidersConstants } from './contract';
import {
  NatsPubSubCommandBus,
  PubSubCommandBusToken,
} from './buses/nats-pubsub-command-bus';
import {
  NatsPubSubQueryBus,
  PubSubQueryBusToken,
} from './buses/nats-pubsub-query-bus';

@Global()
@Module({
  imports: [CqrsModule],
})
export class JetstreamModule {
  static register(option: any): DynamicModule {
    const jetstreamProviders = {
      provide: ProvidersConstants.JETSTREAM_PROVIDER,
      useFactory: (): any => {
        return new NestjsJetstream().connect(option);
      },
    };

    const configProv = {
      provide: ProvidersConstants.JETSTREAM_CONNECTION_CONFIG_PROVIDER,
      useValue: {
        ...option,
      },
    };
    const pubSubCommandBus = {
      provide: PubSubCommandBusToken,
      useClass: NatsPubSubCommandBus,
    };
    const pubSubQueryBus = {
      provide: PubSubQueryBusToken,
      useClass: NatsPubSubQueryBus,
    };

    return {
      module: JetstreamModule,
      providers: [
        jetstreamProviders,
        configProv,
        pubSubCommandBus,
        pubSubQueryBus,
      ],
      exports: [
        jetstreamProviders,
        configProv,
        pubSubCommandBus,
        pubSubQueryBus,
      ],
    };
  }

  static forFeature(config: any): DynamicModule {
    if (config === undefined || config === null) {
      throw new Error('Config missing');
    }

    return {
      module: JetstreamModule,
      providers: [
        {
          provide: ProvidersConstants.JETSTREAM_STREAM_CONFIG_PROVIDER,
          useValue: {
            ...config,
          },
        },
        // ...config.pubSubCommandHandlers,
        Jetstream,
      ],
      exports: [Jetstream],
    };
  }
}
