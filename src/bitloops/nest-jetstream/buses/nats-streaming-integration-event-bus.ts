import { Inject, Injectable } from '@nestjs/common';
import {
  NatsConnection,
  JSONCodec,
  JetStreamClient,
  JetStreamPublishOptions,
  consumerOpts,
  createInbox,
} from 'nats';
import { Application, Infra } from '@src/bitloops/bl-boilerplate-core';
import { NestjsJetstream } from '../nestjs-jetstream.class';
import { IEvent } from '@src/bitloops/bl-boilerplate-core/domain/events/IEvent';
import { EventHandler } from '@src/bitloops/bl-boilerplate-core/domain/events/IEventBus';
import { ProvidersConstants } from '../jetstream.constants';

const jsonCodec = JSONCodec();

@Injectable()
export class NatsStreamingIntegrationEventBus
  implements Infra.EventBus.IEventBus
{
  private nc: NatsConnection;
  private js: JetStreamClient;
  constructor(
    @Inject(ProvidersConstants.JETSTREAM_PROVIDER)
    private readonly jetStreamProvider: NestjsJetstream,
  ) {
    this.nc = this.jetStreamProvider.getConnection();
    this.js = this.nc.jetstream();
  }

  async publish(
    domainEventsInput:
      | Infra.EventBus.IntegrationEvent<any>
      | Infra.EventBus.IntegrationEvent<any>[],
  ): Promise<void> {
    let integrationEvents: Infra.EventBus.IntegrationEvent<any>[];
    Array.isArray(domainEventsInput)
      ? (integrationEvents = domainEventsInput)
      : (integrationEvents = [domainEventsInput]);
    integrationEvents.forEach(async (integrationEvent) => {
      const options: Partial<JetStreamPublishOptions> = { msgID: '' };

      const message = jsonCodec.encode(integrationEvent);
      const subject =
        NatsStreamingIntegrationEventBus.getSubjectFromEventInstance(
          integrationEvent,
        );
      console.log('publishing integration event to:', subject);

      try {
        await this.js.publish(subject, message, options);
      } catch (err) {
        // NatsError: 503
        console.error('Error publishing integration event to:', subject, err);
      }

      // the jetstream returns an acknowledgement with the
      // stream that captured the message, it's assigned sequence
      // and whether the message is a duplicate.
      // const stream = pubAck.stream;
      // const seq = pubAck.seq;
      // const duplicate = pubAck.duplicate;
    });
  }

  async subscribe(subject: string, handler: Application.IHandle) {
    const durableName = NatsStreamingIntegrationEventBus.getDurableName(
      subject,
      handler,
    );

    const stream = subject.split('.')[0];
    await this.jetStreamProvider.createStreamIfNotExists(stream, subject);
    const opts = consumerOpts();
    opts.durable(durableName);
    opts.manualAck();
    opts.ackExplicit();
    opts.deliverTo(createInbox());

    try {
      console.log('---Subscribing integration event to:', {
        subject,
        durableName,
      });
      // this.logger.log(`
      //   Subscribing ${subject}!
      // `);
      const sub = await this.js.subscribe(subject, opts);
      (async () => {
        for await (const m of sub) {
          const integrationEvent = jsonCodec.decode(m.data) as any;

          const reply = await handler.handle(integrationEvent);
          m.ack();

          console.log(
            `[${sub.getProcessed()}]: ${JSON.stringify(
              jsonCodec.decode(m.data),
            )}`,
          );
        }
      })();
    } catch (err) {
      console.error('Error subscribing to integration event:', err);
    }
  }

  unsubscribe<T extends IEvent<any>>(
    topic: string,
    eventHandler: EventHandler<T>,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }

  static getSubjectFromHandler(
    handler: Application.IHandleIntegrationEvent,
  ): string {
    const event = handler.event;
    const boundedContext = handler.boundedContext;
    const stream =
      NatsStreamingIntegrationEventBus.getStreamName(boundedContext);
    const version = handler.version;
    const subject = `${stream}.${event.name}.${version}`;
    return subject;
  }

  static getSubjectFromEventInstance(
    integrationEvent: Infra.EventBus.IntegrationEvent<any>,
  ): string {
    const boundedContext = integrationEvent.metadata.fromContextId;
    const stream =
      NatsStreamingIntegrationEventBus.getStreamName(boundedContext);
    const version = integrationEvent.metadata.version;
    const subject = `${stream}.${integrationEvent.constructor.name}.${version}`;
    return subject;
  }

  static getStreamName(boundedContext: string) {
    return `IntegrationEvents_${boundedContext}`;
  }

  static getDurableName(subject: string, handler: Application.IHandle) {
    // Durable name cannot contain a dot
    const subjectWithoutDots = subject.replace(/\./g, '-');
    return `${subjectWithoutDots}-${handler.constructor.name}`;
  }
}
