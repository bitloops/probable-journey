import { Inject, Injectable } from '@nestjs/common';
import {
  NatsConnection,
  JSONCodec,
  JetStreamClient,
  JetStreamPublishOptions,
  consumerOpts,
  createInbox,
} from 'nats';
import { Application, Domain, Infra } from '@src/bitloops/bl-boilerplate-core';
import { NestjsJetstream } from '../nestjs-jetstream.class';
import { IEvent } from '@src/bitloops/bl-boilerplate-core/domain/events/IEvent';
import { EventHandler } from '@src/bitloops/bl-boilerplate-core/domain/events/IEventBus';
import { ProvidersConstants } from '../jetstream.constants';

const jsonCodec = JSONCodec();

@Injectable()
export class NatsStreamingDomainEventBus implements Infra.EventBus.IEventBus {
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
      const stream = NatsStreamingDomainEventBus.getStreamName(boundedContext);
      const subject = `${stream}.${domainEvent.constructor.name}`;
      const options: Partial<JetStreamPublishOptions> = { msgID: '' };
      // const pubAck =
      domainEvent.data = domainEvent.data.toPrimitives();
      // console.log('serializedDomainEvent', domainEvent);
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
    const durableName = NatsStreamingDomainEventBus.getDurableName(
      subject,
      handler,
    );
    const opts = consumerOpts();
    opts.durable(durableName);
    opts.manualAck();
    opts.ackExplicit();
    opts.deliverTo(createInbox());

    const stream = subject.split('.')[0];
    await this.jetStreamProvider.createStreamIfNotExists(stream, subject);

    try {
      console.log('---Subscribing domain event to:', { subject, durableName });
      // this.logger.log(`
      //   Subscribing ${subject}!
      // `);
      const sub = await this.js.subscribe(subject, opts);
      (async () => {
        // console.log('Starting domain event loop...');
        for await (const m of sub) {
          console.log('Received domainEvent::');
          const domainEvent = jsonCodec.decode(m.data) as any;
          // domainEvent.data = Domain.EventData.fromPrimitives(domainEvent.data);

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
      console.log(
        'Error subscribing to domain event:',
        { subject, durableName },
        err,
      );
    }
  }

  unsubscribe<T extends IEvent<any>>(
    topic: string,
    eventHandler: EventHandler<T>,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }

  static getSubjectFromHandler(handler: Application.IHandle): string {
    const event = handler.event;
    const boundedContext = handler.boundedContext;
    const stream = NatsStreamingDomainEventBus.getStreamName(boundedContext);
    const subject = `${stream}.${event.name}`;
    return subject;
  }

  static getSubjectFromEventInstance(
    domainEvent: Domain.IDomainEvent<any>,
  ): string {
    const boundedContext = domainEvent.metadata.fromContextId;
    const stream = NatsStreamingDomainEventBus.getStreamName(boundedContext);
    const subject = `${stream}.${domainEvent.constructor.name}`;
    return subject;
  }

  static getStreamName(boundedContext: string) {
    return `DomainEvents_${boundedContext}`;
  }

  static getDurableName(subject: string, handler: Application.IHandle) {
    // Durable name cannot contain a dot
    const subjectWithoutDots = subject.replace(/\./g, '-');
    return `${subjectWithoutDots}-${handler.constructor.name}`;
  }
}
