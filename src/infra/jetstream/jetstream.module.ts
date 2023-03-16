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
import {
  NatsStreamingDomainEventBus,
  StreamingDomainEventBusToken,
} from './buses/nats-streaming-domain-event-bus';
import { JetstreamModuleFeatureConfig } from './interfaces/module-feature-input.interface';

const pubSubCommandBus = {
  provide: PubSubCommandBusToken,
  useClass: NatsPubSubCommandBus,
};
const pubSubQueryBus = {
  provide: PubSubQueryBusToken,
  useClass: NatsPubSubQueryBus,
};

const streamingDomainEventBus = {
  provide: StreamingDomainEventBusToken,
  useClass: NatsStreamingDomainEventBus,
};

@Global()
@Module({})
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
        streamingDomainEventBus,
      ],
      exports: [
        jetstreamProviders,
        configProv,
        pubSubCommandBus,
        pubSubQueryBus,
        streamingDomainEventBus,
      ],
    };
  }

  static forFeature(config: JetstreamModuleFeatureConfig): DynamicModule {
    if (config === undefined || config === null) {
      throw new Error('Config missing');
    }
    const {
      pubSubCommandHandlers,
      importedModule,
      pubSubQueryHandlers,
      streamingDomainEventHandlers,
    } = config;

    const PubSubCommandHandlers: Provider<any>[] = [
      {
        provide: 'PubSubCommandHandlers',
        useFactory: (commandBus: PubSubCommandBus, ...commandHandlers) => {
          console.log('pubSubCommandHandler', pubSubCommandHandlers);
          commandHandlers.forEach((handler) => {
            const command = handler.command;
            const boundedContext = handler.boundedContext;
            commandBus.pubSubSubscribe(
              `${boundedContext}.${command?.name}`,
              handler,
            );
          });
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
        useFactory: (queryBus: PubSubQueryBus, ...queryHandlers) => {
          console.log('pubSubQueryHandler', pubSubQueryHandlers);
          queryHandlers.forEach((handler) => {
            const query = handler.query;
            const boundedContext = handler.boundedContext;
            console.log(
              'Subscribe PubSubQueryHandlers',
              `${boundedContext}.${query?.name}`,
            );
            queryBus.pubSubSubscribe(
              `${boundedContext}.${query?.name}`,
              handler,
            );
          });
          return;
        },
        inject: [
          { token: PubSubQueryBusToken, optional: false },
          ...pubSubQueryHandlers,
        ],
      },
    ];
    const StreamingDomainEventHandlers: Provider<any>[] = [
      {
        provide: 'StreamingDomainEventHandlers',
        useFactory: (
          eventBus: NatsStreamingDomainEventBus,
          ...domainEventHandlers
        ) => {
          domainEventHandlers.forEach((handler) => {
            const event = handler.event;
            const boundedContext = handler.boundedContext;
            const stream = `DomainEvents_${boundedContext}`;
            const subject = `${stream}.${event.name}`;
            console.log('Subscribe StreamingDomainEventHandler', subject);
            eventBus.subscribe(subject, handler);
          });
          return;
        },
        inject: [
          { token: StreamingDomainEventBusToken, optional: false },
          ...streamingDomainEventHandlers,
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
        ...StreamingDomainEventHandlers,
        // ...config.pubSubCommandHandlers,
        Jetstream,
      ],
      exports: [Jetstream],
    };
  }
}
