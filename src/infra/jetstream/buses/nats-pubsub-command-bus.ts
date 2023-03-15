import { Inject, Injectable } from '@nestjs/common';
import { ProvidersConstants } from '../';
import { NatsConnection, JSONCodec } from 'nats';
import { Application } from '@src/bitloops/bl-boilerplate-core';

const jsonCodec = JSONCodec();

export interface PubSubCommandBus {
  publish(command: any): Promise<void>;
  pubSubSubscribe(
    subject: string,
    handler: Application.IUseCase<any, any>,
  ): Promise<void>;
}

export const PubSubCommandBusToken = Symbol('PubSubCommandBus');

@Injectable()
export class NatsPubSubCommandBus implements PubSubCommandBus {
  private nc: NatsConnection;
  constructor(
    @Inject(ProvidersConstants.JETSTREAM_PROVIDER) private readonly nats: any,
  ) {
    this.nc = this.nats.getConnection();
  }

  async publish(command: any): Promise<void> {
    const boundedContext = command.boundedContext;
    const topic = `${boundedContext}.${command.constructor.name}`;
    console.log(
      'Publishing in server:',
      topic,
      this.nats.getConnection().getServer(),
    );

    this.nc.publish(topic, jsonCodec.encode(command));
  }

  async pubSubSubscribe(
    subject: string,
    handler: Application.IUseCase<any, any>,
  ) {
    try {
      console.log('Subscribing to:', subject);
      // this.logger.log(`
      //   Subscribing ${subject}!
      // `);
      const sub = this.nc.subscribe(subject);
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
}
