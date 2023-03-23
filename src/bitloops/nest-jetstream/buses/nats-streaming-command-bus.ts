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
export class NatsStreamingCommandBus
  implements Infra.CommandBus.IStreamCommandBus
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

  async publish(command: Application.Command): Promise<void> {
    const boundedContext = command.metadata.toContextId;
    const stream = NatsStreamingCommandBus.getStreamName(boundedContext);
    const subject = `${stream}.${command.constructor.name}`;
    const options: Partial<JetStreamPublishOptions> = { msgID: '' };
    // console.log('serializedDomainEvent', domainEvent);
    const message = jsonCodec.encode(command);
    console.log('publishing command to:', subject);

    await this.js.publish(subject, message, options);
  }

  async subscribe(
    subject: string,
    handler: Application.ICommandHandler<any, any>,
  ) {
    const durableName = NatsStreamingCommandBus.getDurableName(
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
      console.log('---Subscribing command to:', { subject, durableName });
      // this.logger.log(`
      //   Subscribing ${subject}!
      // `);
      const sub = await this.js.subscribe(subject, opts);
      (async () => {
        // console.log('Starting domain event loop...');
        for await (const m of sub) {
          console.log('Received command::');
          const command = jsonCodec.decode(m.data) as any;

          const reply = await handler.execute(command);
          m.ack();

          console.log(
            `[Command ${sub.getProcessed()}]: ${JSON.stringify(
              jsonCodec.decode(m.data),
            )}`,
          );
        }
        console.log('Exiting command loop...');
      })();
      console.log('Subscribed to:', subject);
    } catch (err) {
      console.log({ subject, durableName });
      console.log('Error subscribing to streaming command:', err);
    }
  }

  unsubscribe<T extends IEvent<any>>(
    topic: string,
    eventHandler: EventHandler<T>,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }

  static getSubjectFromHandler(
    handler: Application.ICommandHandler<any, any>,
  ): string {
    const command = handler.command;
    const boundedContext = handler.boundedContext;

    const stream = NatsStreamingCommandBus.getStreamName(boundedContext);
    return `${stream}.${command?.name}`;
  }

  static getSubjectFromCommandInstance(
    integrationEvent: Infra.EventBus.IntegrationEvent<any>,
  ): string {
    const boundedContext = integrationEvent.metadata.fromContextId;
    const stream = NatsStreamingCommandBus.getStreamName(boundedContext);
    const subject = `${stream}.${integrationEvent.constructor.name}`;
    return subject;
  }

  static getStreamName(boundedContext: string) {
    return `Commands_${boundedContext}`;
  }

  static getDurableName(
    subject: string,

    handler: Application.ICommandHandler<any, any>,
  ) {
    // Durable name cannot contain a dot
    const subjectWithoutDots = subject.replace('.', '-');
    return `${subjectWithoutDots}-${handler.constructor.name}`;
  }
}
