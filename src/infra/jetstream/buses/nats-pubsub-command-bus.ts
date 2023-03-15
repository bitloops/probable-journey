import { Inject, Injectable } from '@nestjs/common';
import { ProvidersConstants } from '../';
import { NatsConnection, JSONCodec } from 'nats';
import { Application } from '@src/bitloops/bl-boilerplate-core';

const jsonCodec = JSONCodec();

export interface PubSubCommandBus {
  publish(command: Application.Command): Promise<void>;
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

  async publish(command: Application.Command): Promise<void> {
    console.log('Publishing in server:', this.nats.getConnection().getServer());
    this.nc.publish(command.commandTopic, jsonCodec.encode(command));
  }
}
