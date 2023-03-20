import { Inject, Injectable } from '@nestjs/common';
import { ProvidersConstants } from '../';
import {
  NatsConnection,
  JSONCodec,
  JetStreamClient,
  JetStreamPublishOptions,
  consumerOpts,
} from 'nats';
import { Application } from '@src/bitloops/bl-boilerplate-core';
import { NestjsJetstream } from '../nestjs-jetstream.class';

const jsonCodec = JSONCodec();

export interface StreamingIntegrationEventBus {
  publish(integrationEvent: any): Promise<void>;
  subscribe(subject: string, handler: Application.IHandle): Promise<void>;
}

@Injectable()
export class NatsStreamingIntegrationEventBus
  implements StreamingIntegrationEventBus
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

  static getStreamName(boundedContext: string) {
    return `IntegrationEvents_${boundedContext}`;
  }

  static getDurableName(subject: string, handler: Application.IHandle) {
    // Durable name cannot contain a dot
    const subjectWithoutDots = subject.replace('.', '-');
    return `${subjectWithoutDots}-${handler.constructor.name}`;
  }

  async publish(integrationEvent: any): Promise<void> {
    const boundedContext = integrationEvent.boundedContext;
    const stream =
      NatsStreamingIntegrationEventBus.getStreamName(boundedContext);
    const subject = `${stream}.${integrationEvent.constructor.name}`;
    // TODO Replace msgID with instanceId
    const options: Partial<JetStreamPublishOptions> = { msgID: '' };
    // const pubAck =
    try {
      await this.js.publish(
        subject,
        jsonCodec.encode(integrationEvent),
        options,
      );
    } catch (err) {
      // NatsError: 503
      console.error('Error publishing integration event:', err);
    }

    // the jetstream returns an acknowledgement with the
    // stream that captured the message, it's assigned sequence
    // and whether the message is a duplicate.
    // const stream = pubAck.stream;
    // const seq = pubAck.seq;
    // const duplicate = pubAck.duplicate;
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
    // opts.deliverTo(createInbox());

    try {
      console.log('Subscribing integration event to:', subject, handler);
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
}
