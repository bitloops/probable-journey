import { Injectable, Inject } from '@nestjs/common';
import {
  BUSES_TOKENS,
  NatsStreamingCommandBus,
  NatsStreamingDomainEventBus,
  NatsStreamingIntegrationEventBus,
} from './buses';
import { PubSubQueryBus } from './buses/nats-pubsub-query-bus';
import { PubSubCommandBus } from './buses/nats-pubsub-command-bus';

export const HANDLERS_TOKENS = {
  STREAMING_COMMAND_HANDLERS: 'StreamingCommandHandlers',
  STREAMING_DOMAIN_EVENT_HANDLERS: 'StreamingDomainEventHandlers',
  STREAMING_INTEGRATION_EVENT_HANDLERS: 'StreamingIntegrationEventHandlers',
  PUBSUB_COMMAND_HANDLERS: 'PubSubCommandHandlers',
  PUBSUB_QUERY_HANDLERS: 'PubSubQueryHandlers',
};

@Injectable()
export class SubscriptionsService {
  constructor(
    @Inject(HANDLERS_TOKENS.STREAMING_DOMAIN_EVENT_HANDLERS)
    private domainEventHandlers: any[],
    @Inject(HANDLERS_TOKENS.PUBSUB_COMMAND_HANDLERS)
    private commandHandlers: any[],
    @Inject(HANDLERS_TOKENS.PUBSUB_QUERY_HANDLERS) private queryHandlers: any[],
    @Inject(HANDLERS_TOKENS.STREAMING_INTEGRATION_EVENT_HANDLERS)
    private integrationEventHandlers: any[],
    @Inject(HANDLERS_TOKENS.STREAMING_COMMAND_HANDLERS)
    private streamingCommandHandlers: any[],
    @Inject(BUSES_TOKENS.PUBSUB_COMMAND_BUS)
    private commandBus: PubSubCommandBus,
    @Inject(BUSES_TOKENS.PUBSUB_QUERY_BYS)
    private queryBus: PubSubQueryBus,
    @Inject(BUSES_TOKENS.STREAMING_DOMAIN_EVENT_BUS)
    private eventBus: NatsStreamingDomainEventBus,
    @Inject(BUSES_TOKENS.STREAMING_INTEGRATION_EVENT_BUS)
    private integrationEventBus: NatsStreamingIntegrationEventBus,
    @Inject(BUSES_TOKENS.STREAMING_COMMAND_BUS)
    private streamingCommandBus: NatsStreamingCommandBus,
  ) {
    this.subscribePubSubCommandHandlers(commandHandlers);
    this.subscribePubSubQueryHandlers(queryHandlers);
    this.subscribeStreamingDomainEventHandlers(domainEventHandlers);
    this.subscribeStreamingIntegrationEventHandlers(integrationEventHandlers);
    this.subscribeStreamingCommandHandlers(streamingCommandHandlers);
  }

  private subscribePubSubCommandHandlers(commandHandlers: any[]) {
    commandHandlers.forEach((handler) => {
      const command = handler.command;
      const boundedContext = handler.boundedContext;
      this.commandBus.pubSubSubscribe(
        `${boundedContext}.${command?.name}`,
        handler,
      );
    });
    console.log(commandHandlers.length);
  }

  private subscribePubSubQueryHandlers(queryHandlers: any[]) {
    queryHandlers.forEach((handler) => {
      const query = handler.query;
      const boundedContext = handler.boundedContext;
      this.queryBus.pubSubSubscribe(
        `${boundedContext}.${query?.name}`,
        handler,
      );
    });
  }

  private subscribeStreamingDomainEventHandlers(domainEventHandlers: any[]) {
    return Promise.all(
      domainEventHandlers.map((handler) => {
        const event = handler.event;
        const boundedContext = handler.boundedContext;
        const stream =
          NatsStreamingDomainEventBus.getStreamName(boundedContext);
        const subject = `${stream}.${event.name}`;
        return this.eventBus.subscribe(subject, handler);
      }),
    );
  }

  private subscribeStreamingIntegrationEventHandlers(
    integrationEventHandlers: any[],
  ) {
    integrationEventHandlers.forEach((handler) => {
      const subject =
        NatsStreamingIntegrationEventBus.getSubjectFromHandler(handler);
      this.integrationEventBus.subscribe(subject, handler);
    });
  }

  private subscribeStreamingCommandHandlers(streamingCommandHandlers: any[]) {
    streamingCommandHandlers.forEach((handler) => {
      const subject = NatsStreamingCommandBus.getSubjectFromHandler(handler);
      this.streamingCommandBus.subscribe(subject, handler);
    });
  }
}
