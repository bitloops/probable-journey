import { Inject, Injectable, Optional } from '@nestjs/common';
import { NatsConnection, JSONCodec, headers, Msg, MsgHdrs } from 'nats';
import { Application, Infra } from '@src/bitloops/bl-boilerplate-core';
import {
  ASYNC_LOCAL_STORAGE,
  ASYNC_LOCAL_STORAGE_FIELDS as METADATA_HEADERS,
  ProvidersConstants,
} from '../jetstream.constants';

const jsonCodec = JSONCodec();

@Injectable()
export class NatsPubSubCommandBus
  implements Infra.CommandBus.IPubSubCommandBus
{
  private nc: NatsConnection;
  constructor(
    @Inject(ProvidersConstants.JETSTREAM_PROVIDER) private readonly nats: any,
    // @Optional()
    @Inject(ASYNC_LOCAL_STORAGE)
    private readonly asyncLocalStorage: any,
  ) {
    this.nc = this.nats.getConnection();
  }

  async publish(command: Application.Command): Promise<void> {
    const topic = NatsPubSubCommandBus.getTopicFromCommandInstance(command);
    console.log('Publishing in :', topic);
    const headers = this.generateHeaders(command);

    this.nc.publish(topic, jsonCodec.encode(command), { headers });
  }

  async request(command: Application.Command): Promise<any> {
    const topic = NatsPubSubCommandBus.getTopicFromCommandInstance(command);

    console.log('Publishing in :', topic);

    const headers = this.generateHeaders(command);

    try {
      const response = await this.nc.request(topic, jsonCodec.encode(command), {
        headers,
        timeout: 10000,
      });
      return jsonCodec.decode(response.data);
    } catch (error) {
      console.log('Error in command request', error);
    }
  }

  async pubSubSubscribe(
    subject: string,
    handler: Application.ICommandHandler<any, any>,
  ) {
    try {
      console.log('Subscribing to:', subject);
      const sub = this.nc.subscribe(subject);
      (async () => {
        for await (const m of sub) {
          const command = jsonCodec.decode(m.data);

          const correlationId = m.headers?.get(METADATA_HEADERS.CORRELATION_ID);
          if (correlationId === undefined) {
            await this.handleReceivedCommand(handler, command, m);
            continue;
          }

          const contextData: any = new Map(Object.entries({ correlationId }));
          this.asyncLocalStorage.run(contextData, async () => {
            this.handleReceivedCommand(handler, command, m);
          });
        }
      })();
    } catch (err) {
      console.log('Error in command-bus subscribe:', err);
    }
  }

  private generateHeaders(command: Application.Command): MsgHdrs {
    const h = headers();
    for (const [key, value] of Object.entries(command.metadata)) {
      h.append(key, value.toString());
    }
    return h;
  }

  static getTopicFromHandler(
    handler: Application.ICommandHandler<any, any>,
  ): string {
    const command = handler.command;
    const boundedContext = handler.boundedContext;

    return `${boundedContext}.${command.name}`;
  }

  static getTopicFromCommandInstance(command: Application.Command): string {
    const boundedContext = command.metadata.toContextId;
    const topic = `${boundedContext}.${command.constructor.name}`;
    return topic;
  }

  private async handleReceivedCommand(
    handler: Application.ICommandHandler<any, any>,
    command: any,
    m: Msg,
  ) {
    const reply = await handler.execute(command);
    if (reply.isOk && reply.isOk() && m.reply) {
      return this.nc.publish(
        m.reply,
        jsonCodec.encode({
          isOk: true,
          data: reply.value,
        }),
      );
    } else if (reply.isFail && reply.isFail() && m.reply) {
      return this.nc.publish(
        m.reply,
        jsonCodec.encode({
          isOk: false,
          error: reply.value,
        }),
      );
    }
    if (!reply) return;
    else console.error('Reply is neither ok nor error:', reply);
  }
}
