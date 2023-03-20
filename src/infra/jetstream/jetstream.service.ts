/* tslint:disable:variable-name */

import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { IEvent, IEventPublisher, IMessageSource } from '@nestjs/cqrs';
import { Application } from '@bitloops/bl-boilerplate-core';
import { Subject } from 'rxjs';
import { v4 } from 'uuid';
import {
  IEventConstructors,
  ProvidersConstants,
  IEventStoreMessage,
} from './contract';
import { consumerOpts, createInbox, JSONCodec } from 'nats';
import { NestjsJetstream } from './nestjs-jetstream.class';

const jsonCodec = JSONCodec();

/**
 * @class Jetstream
 */
@Injectable()
export class Jetstream
  implements IEventPublisher, OnModuleDestroy, /*OnModuleInit,*/ IMessageSource
{
  private logger = new Logger(this.constructor.name);
  private jetstream: NestjsJetstream;
  private eventHandlers: IEventConstructors;
  private subject$: Subject<IEvent>;
  private readonly featureSubjectPrefix: string;

  constructor(
    @Inject(ProvidersConstants.JETSTREAM_PROVIDER) jetstream: NestjsJetstream,
  ) {
    this.jetstream = jetstream;
    // this.jetstream.connect(configService.options || {});
    // this.featureSubjectPrefix =
    //   jetstreamStreamConfig.featureSubjectPrefix || '';
    // this.addEventHandlers(jetstreamStreamConfig.eventHandlers);

    // const subjectSubscriptions = jetstreamStreamConfig.subscriptions;
    // const { pubSubCommandHandlers } = jetstreamStreamConfig;
    // this.subscribePubSubCommandHandlers(pubSubCommandHandlers);

    // this.subscribeSubjects(subjectSubscriptions);
  }

  // async sendAck(id: string) {
  //   try {
  //     await this.jetstream.getConnection().publish(id);
  //   } catch (err) {
  //     this.logger.error(err);
  //   }
  // }

  async subscribePubSubCommandHandlers(
    pubSubCommandHandlers: Application.IUseCase<any, any>[],
  ) {
    console.log('pubSubCommandHandlers', pubSubCommandHandlers);
    pubSubCommandHandlers.forEach((handler) => {
      const command = handler.command;
      const boundedContext = handler.boundedContext;
      this.pubSubSubscribe(`${boundedContext}.${command?.name}`, handler);
    });
  }

  async pubSubSubscribe(
    subject: string,
    handler: Application.IUseCase<any, any>,
  ) {
    const nc = this.jetstream.getConnection();
    try {
      this.logger.log(`
        Subscribing ${subject}!
      `);
      const sub = nc.subscribe('hello');
      (async () => {
        for await (const m of sub) {
          const command = jsonCodec.decode(m.data);
          await handler.execute(command);
          console.log(`[${sub.getProcessed()}]: ${jsonCodec.decode(m.data)}`);
        }
        console.log('subscription closed');
      })();
    } catch (err) {}
  }

  async publish(event: IEvent, stream?: string) {
    if (event === undefined) {
      return;
    }
    if (event === null) {
      return;
    }

    const eventType = event.constructor.name;
    const subjectPrefix = this.featureSubjectPrefix;
    const publishTo = `${subjectPrefix}.${eventType}`;

    const eventPayload: IEventStoreMessage = {
      subjectPrefix,
      createdAt: new Date(),
      eventId: v4(),
      eventNumber: 0,
      eventType,
      eventData: event,
    };

    try {
      await this.jetstream
        .getConnection()
        .publish(publishTo, jsonCodec.encode(eventPayload));
    } catch (err) {
      this.logger.error(err);
    }
  }

  async subscribeSubjects(subjects) {
    await Promise.all(
      subjects.map(async (subject) => {
        return await this.subscribeSubject(subject.name);
      }),
    );
  }

  async subscribeSubject(subject: string): Promise<any> {
    try {
      this.logger.log(`
        Subscribing ${subject}!
      `);

      const opts = consumerOpts();
      opts.durable('me');
      opts.manualAck();
      opts.ackExplicit();
      opts.deliverTo(createInbox());

      const sub = await this.jetstream
        .getConnection()
        .jetstream()
        .subscribe(subject, opts);

      const resolved = (async () => {
        for await (const m of sub) {
          this.onEvent(m.subject, jsonCodec.decode(m.data), m.ack);
        }
      })();
      return resolved;
    } catch (err: any) {
      this.logger.error(err.message);
    }
  }

  async onEvent(eventType: string, payload: any, ack: () => void) {
    payload = JSON.parse(payload);

    const handler = this.eventHandlers[eventType];
    if (!handler) {
      this.logger.error(
        `Received event ${eventType} that could not be handled!`,
      );
      return;
    }

    const rawData = payload.eventData;
    const data = Object.values(rawData);

    if (this.eventHandlers && this.eventHandlers[eventType]) {
      this.subject$.next(this.eventHandlers[eventType](data, ack, payload));
    } else {
      Logger.warn(
        `Event of type ${eventType} not handled`,
        this.constructor.name,
      );
    }
  }

  onDropped(consumer, _reason: string, error: Error) {
    consumer.isLive = false;
    this.logger.error('onDropped => ' + error);
  }

  get isLive(): boolean {
    return true;
  }

  addEventHandlers(eventHandlers: IEventConstructors) {
    this.eventHandlers = { ...this.eventHandlers, ...eventHandlers };
  }
  // onModuleInit(): any {
  //   this.subject$ = (this.eventsBus as any).subject$;
  //   this.bridgeEventsTo((this.eventsBus as any).subject$);
  //   this.eventsBus.publisher = this;
  // }

  onModuleDestroy(): any {
    this.jetstream.close();
  }

  async bridgeEventsTo<T extends IEvent>(subject: Subject<T>): Promise<any> {
    this.subject$ = subject as any;
  }
}
