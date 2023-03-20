import { Inject, Injectable } from '@nestjs/common';
import { ProvidersConstants } from '../';
import {
  NatsConnection,
  JSONCodec,
  JetStreamClient,
  JetStreamPublishOptions,
  consumerOpts,
  createInbox,
} from 'nats';
import { Application, Domain } from '@src/bitloops/bl-boilerplate-core';
import { NestjsJetstream } from '../nestjs-jetstream.class';

const jsonCodec = JSONCodec();

export interface StreamingDomainEventBus {
  publish(domainEvent: any): Promise<void>;
  subscribe(subject: string, handler: Application.IHandle): Promise<void>;
}

export const StreamingDomainEventBusToken = Symbol(
  'StreamingDomainEventBusToken',
);

@Injectable()
export class NatsStreamingDomainEventBus implements StreamingDomainEventBus {
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
    domainEventsInput: Domain.IDomainEvent<any> | Domain.IDomainEvent<any>[],
  ): Promise<void> {
    let domainEvents: Domain.IDomainEvent<any>[];
    Array.isArray(domainEventsInput)
      ? (domainEvents = domainEventsInput)
      : (domainEvents = [domainEventsInput]);
    domainEvents.forEach(async (domainEvent) => {
      const boundedContext = domainEvent.metadata.fromContextId;
      const stream = `DomainEvents_${boundedContext}`;
      const subject = `${stream}.${domainEvent.constructor.name}`;
      const options: Partial<JetStreamPublishOptions> = { msgID: '' };
      // const pubAck =
      domainEvent.data = domainEvent.data.toPrimitives();
      console.log('serializedDomainEvent', domainEvent);
      const message = jsonCodec.encode(domainEvent);
      console.log('publishing domain event to:', subject);

      await this.js.publish(subject, message, options);

      // the jetstream returns an acknowledgement with the
      // stream that captured the message, it's assigned sequence
      // and whether the message is a duplicate.
      // const stream = pubAck.stream;
      // const seq = pubAck.seq;
      // const duplicate = pubAck.duplicate;
    });
  }

  async subscribe(subject: string, handler: Application.IHandle) {
    // Durable name cannot contain a dot
    const subjectWithoutDots = subject.replace('.', '-');
    const durableName = `${subjectWithoutDots}-${handler.constructor.name}`;
    const opts = consumerOpts();
    opts.durable(durableName);
    opts.manualAck();
    opts.ackExplicit();
    opts.deliverTo(createInbox());

    // console.log('all streams');
    // await this.jetStreamProvider.listAllStreams();
    const stream = subject.split('.')[0];
    // console.log('Checking if stream exists:', { stream, subject });
    await this.jetStreamProvider.createStreamIfNotExists(stream, subject);
    // const jsm = await this.nc.jetstreamManager();
    // add a stream
    // const stream = subject.split('.')[0];
    // try {
    //   await jsm.streams.add({ name: stream, subjects: [subject] });
    // } catch (err) {
    //   // retrieve info about the stream by its name
    // try {
    //     const si = await jsm.streams.info(stream);

    //     // update a stream configuration
    //     si.config.subjects?.push(subject);
    //     await jsm.streams.update(stream, si.config);
    //   } catch (err) {
    //     console.error('Error updating stream:', err);
    //   }
    // }

    try {
      console.log('Subscribing domain event to:', subject);
      // this.logger.log(`
      //   Subscribing ${subject}!
      // `);
      const sub = await this.js.subscribe(subject, opts);
      (async () => {
        console.log('Starting domain event loop...');
        for await (const m of sub) {
          console.log('Received domainEvent::');
          const domainEvent = jsonCodec.decode(m.data) as any;

          const reply = await handler.handle(domainEvent);
          m.ack();

          console.log(
            `[Domain Event ${sub.getProcessed()}]: ${JSON.stringify(
              jsonCodec.decode(m.data),
            )}`,
          );
        }
        console.log('Exiting domain event loop...');
      })();
    } catch (err) {
      console.log('Error subscribing to domain event:', err);
      console.log({ subject });
    }
  }
}
