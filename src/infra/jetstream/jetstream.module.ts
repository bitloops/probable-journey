import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { ConnectionOptions } from 'nats';
import { Jetstream } from './jetstream.service';
import { NestjsJetstream } from './nestjs-jetstream.class';
import { ProvidersConstants } from './contract';
import {
  NatsPubSubCommandBus,
  PubSubCommandBus,
  PubSubCommandBusToken,
} from './buses/nats-pubsub-command-bus';
import {
  NatsPubSubQueryBus,
  PubSubQueryBus,
  PubSubQueryBusToken,
} from './buses/nats-pubsub-query-bus';

const pubSubCommandBus = {
  provide: PubSubCommandBusToken,
  useClass: NatsPubSubCommandBus,
};
const pubSubQueryBus = {
  provide: PubSubQueryBusToken,
  useClass: NatsPubSubQueryBus,
};

@Global()
@Module({
  imports: [],
})
export class JetstreamModule {
  static forRoot(option: ConnectionOptions): DynamicModule {
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
    const { pubSubCommandHandlers, importedModule, pubSubQueryHandlers } =
      config;

    const PubSubCommandHandlers: Provider<any>[] = [
      {
        provide: 'PubSubCommandHandlers',
        useFactory: (commandBus: PubSubCommandBus, ...args) => {
          console.log('pubSubCommandHandler', pubSubCommandHandlers);
          args.forEach((handler) => {
            const command = handler.command;
            const boundedContext = handler.boundedContext;
            commandBus.pubSubSubscribe(
              `${boundedContext}.${command?.name}`,
              handler,
            );
          });
          [...args];
          return;
        },
        inject: [
          { token: PubSubCommandBusToken, optional: false },
          ...pubSubCommandHandlers,
        ],
      },
    ];
    const PubSubQueryHandlers: Provider<any>[] = [
      {
        provide: 'PubSubQueryHandlers',
        useFactory: (queryBus: PubSubQueryBus, ...args) => {
          console.log('pubSubQueryHandler', pubSubQueryHandlers);
          args.forEach((handler) => {
            const query = handler.query;
            const boundedContext = handler.boundedContext;
            console.log(
              'subscribe',
              `${boundedContext}.${query?.name}`,
              handler,
            );
            queryBus.pubSubSubscribe(
              `${boundedContext}.${query?.name}`,
              handler,
            );
          });
          [...args];
          return;
        },
        inject: [
          { token: PubSubQueryBusToken, optional: false },
          ...pubSubQueryHandlers,
        ],
      },
    ];

    return {
      imports: [importedModule],
      module: JetstreamModule,
      providers: [
        {
          provide: ProvidersConstants.JETSTREAM_STREAM_CONFIG_PROVIDER,
          useValue: {
            ...config,
          },
        },
        ...PubSubCommandHandlers,
        ...PubSubQueryHandlers,
        // ...config.pubSubCommandHandlers,
        Jetstream,
      ],
      exports: [Jetstream],
    };
  }
}
