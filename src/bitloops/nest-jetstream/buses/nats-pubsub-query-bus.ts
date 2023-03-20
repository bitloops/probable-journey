import { Inject, Injectable } from '@nestjs/common';
import { ProvidersConstants } from '../contract';
import { NatsConnection, JSONCodec } from 'nats';
import { Application } from '@src/bitloops/bl-boilerplate-core';

const jsonCodec = JSONCodec();

export interface PubSubQueryBus {
  request(query: any): Promise<any>;
  pubSubSubscribe(
    subject: string,
    handler: Application.IQueryHandler<any, any>,
  ): Promise<void>;
}

@Injectable()
export class NatsPubSubQueryBus implements PubSubQueryBus {
  private nc: NatsConnection;
  constructor(
    @Inject(ProvidersConstants.JETSTREAM_PROVIDER) private readonly nats: any,
  ) {
    this.nc = this.nats.getConnection();
  }

  async publish(query: any): Promise<void> {
    const boundedContext = query.boundedContext;
    const topic = `${boundedContext}.${query.constructor.name}`;
    console.log(
      'Publishing in server:',
      topic,
      this.nats.getConnection().getServer(),
    );

    this.nc.publish(topic, jsonCodec.encode(query));
  }

  async request(query: any): Promise<any> {
    const boundedContext = query.boundedContext;
    const topic = `${boundedContext}.${query.constructor.name}`;
    console.log(
      'Publishing request in server:',
      topic,
      this.nats.getConnection().getServer(),
      query,
    );
    return await this.nc
      .request(topic, jsonCodec.encode(query))
      .then((response) => {
        const data = jsonCodec.decode(response.data);
        console.log('Response in query request:', data);
        return data;
      })
      .catch((err) => {
        console.log('Error in query request:', err);
      });
  }

  async pubSubSubscribe(
    subject: string,
    handler: Application.IQueryHandler<any, any>,
  ) {
    try {
      console.log('Subscribing query to:', subject);
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
      console.log('Error in query subscription:', err);
    }
  }
}
