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
export class NatsStreamingMessageBus implements Infra.EventBus.IEventBus {
  private nc: NatsConnection;
  private js: JetStreamClient;
  constructor(
    @Inject(ProvidersConstants.JETSTREAM_PROVIDER)
    private readonly jetStreamProvider: NestjsJetstream,
  ) {
    this.nc = this.jetStreamProvider.getConnection();
    this.js = this.nc.jetstream();
  }

  async publish(message: Infra.EventBus.IEvent<any>): Promise<void> {
    const options: Partial<JetStreamPublishOptions> = { msgID: '' };

    const messageEncoded = jsonCodec.encode(message);
    const subject =
      NatsStreamingMessageBus.getSubjectFromEventInstance(messageEncoded);
    console.log('publishing integration event to:', subject);

    try {
      await this.js.publish(subject, messageEncoded, options);
    } catch (err) {
      // NatsError: 503
      console.error('Error publishing integration event to:', subject, err);
    }
  }

  async subscribe(subject: string, handler: Application.IHandle) {
    const durableName = NatsStreamingMessageBus.getDurableName(
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
          const message = jsonCodec.decode(m.data) as any;

          const reply = await handler.handle(message);
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

  unsubscribe<T extends Infra.EventBus.IEvent<any>>(
    topic: string,
    eventHandler: EventHandler<T>,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }

  static getSubjectFromHandler(handler: Application.IHandle): string {
    const event = handler.event;
    const boundedContext = handler.boundedContext;
    const stream = NatsStreamingMessageBus.getStreamName(boundedContext);
    const subject = `${stream}.${event.name}`;
    return subject;
  }

  static getSubjectFromEventInstance(message: any): string {
    const boundedContext = message.metadata.fromContextId;
    const stream = NatsStreamingMessageBus.getStreamName(boundedContext);
    const version = message.metadata.version;
    const subject = `${stream}.${message.constructor.name}.${version}`;
    return subject;
  }

  static getStreamName(boundedContext: string) {
    return `Messages_${boundedContext}`;
  }

  static getDurableName(subject: string, handler: Application.IHandle) {
    // Durable name cannot contain a dot
    const subjectWithoutDots = subject.replace(/\./g, '-');
    return `${subjectWithoutDots}-${handler.constructor.name}`;
  }
}
