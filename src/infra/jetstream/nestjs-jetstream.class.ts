import { NatsConnectionOptions } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { Logger } from '@nestjs/common';
import { connect, JetStreamManager, NatsConnection } from 'nats';

/**
 * @description NATS setup from https://github.com/nats-io/nats.js
 */
export class NestjsJetstream {
  [x: string]: any;
  private logger: Logger = new Logger(this.constructor.name);
  private nc: NatsConnection;
  private jsm: JetStreamManager;

  constructor() {
    this.type = 'nats-jetstream';
  }

  async connect(options: NatsConnectionOptions) {
    try {
      this.nc = await connect(options);
      console.log('options', options);
      this.jsm = await this.nc.jetstreamManager();
      console.log(`connected to ${this.nc.getServer()}`);
      // add a stream
      const stream = 'test';
      const subj = 'test.*';
      await this.jsm.streams.add({ name: stream, subjects: [subj] });
      // this.connection.on('connect', () => {
      //   this.isConnected = true;
      //   this.logger.log('NATS connected!');
      // });
      // this.connection.on('closed', () => {
      //   this.isConnected = false;
      //   this.logger.error('NATS closed!');
      //   this.connect(options);
      // });

      return this;
    } catch (e: any) {
      this.logger.error(e);
      throw new Error(e);
    }
  }

  getConnection() {
    return this.nc;
  }

  isConnected() {
    return this.nc && !this.nc.isClosed() === true;
  }

  /**
   * Close NATS connection
   */
  async close() {
    await this.nc.close();
    return this;
  }
}
