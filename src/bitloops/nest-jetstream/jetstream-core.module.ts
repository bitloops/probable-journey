import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { ConnectionOptions } from 'nats';
import { Jetstream } from './jetstream.service';
import { NestjsJetstream } from './nestjs-jetstream.class';
import { ProvidersConstants } from './contract';
import {
  NatsPubSubCommandBus,
  PubSubCommandBus,
} from './buses/nats-pubsub-command-bus';
import {
  NatsPubSubQueryBus,
  PubSubQueryBus,
} from './buses/nats-pubsub-query-bus';
import { NatsStreamingDomainEventBus } from './buses/nats-streaming-domain-event-bus';
import { JetstreamModuleFeatureConfig } from './interfaces/module-feature-input.interface';
import { BUSES_TOKENS } from './buses/constants';
import {
  NatsStreamingIntegrationEventBus,
  NatsStreamingCommandBus,
} from './buses';
import { Application } from '../bl-boilerplate-core';

const pubSubCommandBus = {
  provide: BUSES_TOKENS.PUBSUB_COMMAND_BUS,
  useClass: NatsPubSubCommandBus,
};
const pubSubQueryBus = {
  provide: BUSES_TOKENS.PUBSUB_QUERY_BYS,
  useClass: NatsPubSubQueryBus,
};

const streamingDomainEventBus = {
  provide: BUSES_TOKENS.STREAMING_DOMAIN_EVENT_BUS,
  useClass: NatsStreamingDomainEventBus,
};

const streamingIntegrationEventBus = {
  provide: BUSES_TOKENS.STREAMING_INTEGRATION_EVENT_BUS,
  useClass: NatsStreamingIntegrationEventBus,
};

const streamingCommandBus = {
  provide: BUSES_TOKENS.STREAMING_COMMAND_BUS,
  useClass: NatsStreamingCommandBus,
};

@Global()
@Module({})
export class JetstreamCoreModule {
  static forRoot(connectionOptions: ConnectionOptions): DynamicModule {
    const jetstreamProviders = {
      provide: ProvidersConstants.JETSTREAM_PROVIDER,
      useFactory: (): any => {
        return new NestjsJetstream().connect(connectionOptions);
      },
    };

    const configProv = {
      provide: ProvidersConstants.JETSTREAM_CONNECTION_CONFIG_PROVIDER,
      useValue: {
        ...connectionOptions,
      },
    };

    return {
      module: JetstreamCoreModule,
      providers: [
        jetstreamProviders,
        configProv,
        pubSubCommandBus,
        pubSubQueryBus,
        streamingDomainEventBus,
        streamingIntegrationEventBus,
        streamingCommandBus,
      ],
      exports: [
        jetstreamProviders,
        configProv,
        pubSubCommandBus,
        pubSubQueryBus,
        streamingDomainEventBus,
        streamingIntegrationEventBus,
        streamingCommandBus,
      ],
    };
  }

  static forFeature(config: JetstreamModuleFeatureConfig): DynamicModule {
    if (config === undefined || config === null) {
      throw new Error('Config missing');
    }
    const { moduleOfHandlers } = config;
    let {
      pubSubCommandHandlers,
      pubSubQueryHandlers,
      streamingDomainEventHandlers,
      streamingIntegrationEventHandlers,
      streamingCommandHandlers,
    } = config;
    if (!pubSubCommandHandlers) pubSubCommandHandlers = [];
    if (!pubSubQueryHandlers) pubSubQueryHandlers = [];
    if (!streamingDomainEventHandlers) streamingDomainEventHandlers = [];
    if (!streamingIntegrationEventHandlers)
      streamingIntegrationEventHandlers = [];
    if (!streamingCommandHandlers) streamingCommandHandlers = [];

    const PubSubCommandHandlersSubscriptions: Provider<any>[] = [
      {
        provide: 'PubSubCommandHandlers',
        useFactory: (commandBus: PubSubCommandBus, ...commandHandlers) => {
          commandHandlers.forEach((handler) => {
            const command = handler.command;
            const boundedContext = handler.boundedContext;
            commandBus.pubSubSubscribe(
              `${boundedContext}.${command?.name}`,
              handler,
            );
          });
        },
        inject: [
          { token: BUSES_TOKENS.PUBSUB_COMMAND_BUS, optional: false },
          ...pubSubCommandHandlers,
        ],
      },
    ];
    const PubSubQueryHandlersSubscriptions: Provider<any>[] = [
      {
        provide: 'PubSubQueryHandlers',
        useFactory: (queryBus: PubSubQueryBus, ...queryHandlers) => {
          queryHandlers.forEach((handler) => {
            const query = handler.query;
            const boundedContext = handler.boundedContext;
            queryBus.pubSubSubscribe(
              `${boundedContext}.${query?.name}`,
              handler,
            );
          });
        },
        inject: [
          { token: BUSES_TOKENS.PUBSUB_QUERY_BYS, optional: false },
          ...pubSubQueryHandlers,
        ],
      },
    ];
    const StreamingDomainEventHandlersSubscriptions: Provider<any>[] = [
      {
        provide: 'StreamingDomainEventHandlers',
        useFactory: (
          eventBus: NatsStreamingDomainEventBus,
          ...domainEventHandlers: Application.IHandle[]
        ) => {
          domainEventHandlers.forEach((handler) => {
            const event = handler.event;
            const boundedContext = handler.boundedContext;
            const stream =
              NatsStreamingDomainEventBus.getStreamName(boundedContext);
            const subject = `${stream}.${event.name}`;
            eventBus.subscribe(subject, handler);
          });
          return;
        },
        inject: [
          { token: BUSES_TOKENS.STREAMING_DOMAIN_EVENT_BUS, optional: false },
          ...streamingDomainEventHandlers,
        ],
      },
    ];

    const StreamingIntegrationEventHandlersSubscriptions: Provider<any>[] = [
      {
        provide: 'StreamingIntegrationEventHandlers',
        useFactory: (
          eventBus: NatsStreamingIntegrationEventBus,
          ...integrationEventHandlers: Application.IHandle[]
        ) => {
          integrationEventHandlers.forEach((handler) => {
            const subject =
              NatsStreamingIntegrationEventBus.getSubjectFromHandler(handler);
            eventBus.subscribe(subject, handler);
          });
          return;
        },
        inject: [
          {
            token: BUSES_TOKENS.STREAMING_INTEGRATION_EVENT_BUS,
            optional: false,
          },
          ...streamingIntegrationEventHandlers,
        ],
      },
    ];

    const StreamingCommandHandlersSubscriptions: Provider<any>[] = [
      {
        provide: 'StreamingCommandHandlers',
        useFactory: (
          commandBus: NatsStreamingCommandBus,
          ...commandHandlers: Application.ICommandHandler<any, any>[]
        ) => {
          commandHandlers.forEach((handler) => {
            const subject =
              NatsStreamingCommandBus.getSubjectFromHandler(handler);
            commandBus.subscribe(subject, handler);
          });
          return;
        },
        inject: [
          { token: BUSES_TOKENS.STREAMING_COMMAND_BUS, optional: false },
          ...streamingCommandHandlers,
        ],
      },
    ];

    return {
      imports: [moduleOfHandlers],
      module: JetstreamCoreModule,
      providers: [
        {
          provide: ProvidersConstants.JETSTREAM_STREAM_CONFIG_PROVIDER,
          useValue: {
            ...config,
          },
        },
        ...PubSubCommandHandlersSubscriptions,
        ...PubSubQueryHandlersSubscriptions,
        ...StreamingDomainEventHandlersSubscriptions,
        ...StreamingIntegrationEventHandlersSubscriptions,
        ...StreamingCommandHandlersSubscriptions,
        Jetstream,
        pubSubCommandBus,
        pubSubQueryBus,
        streamingDomainEventBus,
      ],
      exports: [
        Jetstream,
        pubSubCommandBus,
        pubSubQueryBus,
        streamingDomainEventBus,
      ],
    };
  }
}
