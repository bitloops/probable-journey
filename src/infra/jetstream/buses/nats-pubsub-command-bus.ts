import { Inject, Injectable } from '@nestjs/common';
import { ProvidersConstants } from '../';
import { NatsConnection, JSONCodec } from 'nats';
import { Application } from '@src/bitloops/bl-boilerplate-core';

const jsonCodec = JSONCodec();

export interface PubSubCommandBus {
  publish(command: any): Promise<void>;
  request(command: any): Promise<any>;
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

  async request(command: any): Promise<any> {
    const boundedContext = command.boundedContext;
    const topic = `${boundedContext}.${command.constructor.name}`;
    console.log(
      'Publishing in server:',
      topic,
      this.nats.getConnection().getServer(),
    );

    return await this.nc
      .request(topic, jsonCodec.encode(command))
      .then((response) => {
        return jsonCodec.decode(response.data);
      })
      .catch((err) => {
        console.log('Error in command request:', err);
      });
  }

  async pubSubSubscribe(
    subject: string,
    handler: Application.ICommandHandler<any, any>,
  ) {
    try {
      console.log('Subscribing to:', subject);
      // this.logger.log(`
      //   Subscribing ${subject}!
      // `);
      const sub = this.nc.subscribe(subject);
      (async () => {
        for await (const m of sub) {
          const query = jsonCodec.decode(m.data);
          const reply = await handler.execute(query);
          if (reply.isOk && m.reply) {
            this.nc.publish(
              m.reply,
              jsonCodec.encode({
                isOk: true,
                data: reply.value,
              }),
            );
          }
          console.log(
            `[${sub.getProcessed()}]: ${JSON.stringify(
              jsonCodec.decode(m.data),
            )}`,
          );
        }
        console.log('subscription closed');
      })();
    } catch (err) {
      console.log('Error in command-bus subscribe:', err);
    }
  }
}
