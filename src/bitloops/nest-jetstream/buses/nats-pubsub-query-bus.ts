import { Inject, Injectable, Optional } from '@nestjs/common';
import { NatsConnection, JSONCodec, headers, MsgHdrs } from 'nats';
import { Application, Infra } from '@src/bitloops/bl-boilerplate-core';
import {
  ASYNC_LOCAL_STORAGE,
  ProvidersConstants,
} from '../jetstream.constants';

const jsonCodec = JSONCodec();

@Injectable()
export class NatsPubSubQueryBus implements Infra.QueryBus.IQueryBus {
  private nc: NatsConnection;
  constructor(
    @Inject(ProvidersConstants.JETSTREAM_PROVIDER) private readonly nats: any,
    // @Optional()
    @Inject(ASYNC_LOCAL_STORAGE)
    private readonly asyncLocalStorage: any,
  ) {
    this.nc = this.nats.getConnection();
  }

  async request(query: any): Promise<any> {
    const topic = NatsPubSubQueryBus.getTopicFromQueryInstance(query);
    console.log('Requesting query:', topic);

    const headers = this.generateHeaders(query);

    try {
      const response = await this.nc.request(topic, jsonCodec.encode(query), {
        headers,
        timeout: 10000,
      });

      const data = jsonCodec.decode(response.data);
      console.log('Response in query request:', data);
      return data;
    } catch (err) {
      console.log('Error in query request:', err);
    }
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

  private generateHeaders(query: Application.IQuery): MsgHdrs {
    const h = headers();
    for (const [key, value] of Object.entries(query.metadata)) {
      h.append(key, value.toString());
    }
    return h;
  }

  static getTopicFromHandler(
    handler: Application.IQueryHandler<any, any>,
  ): string {
    const query = handler.query;
    const boundedContext = handler.boundedContext;

    return `${boundedContext}.${query.name}`;
  }

  static getTopicFromQueryInstance(query: Application.IQuery): string {
    const boundedContext = query.metadata.toContextId;
    const topic = `${boundedContext}.${query.constructor.name}`;
    return topic;
  }
}
